---
title: "Webhooks that never lose or double-apply a payment, with just Supabase"
description: "HMAC, idempotency and a transactional outbox: the three pieces that make a payment flow survive retries, replays and crashed workers."
date: 2026-10-19
tags: ["supabase", "postgres", "webhooks", "fintech"]
translationKey: idempotent-webhooks
---

Anyone who works with payments learns quickly that the happy path is the easy part. The hard part is what happens when the provider sends the same event twice, when someone finds your webhook URL, or when the database commits a change but the notification to your customer gets lost on the way.

This post walks through the three pieces I use to handle that, all inside Supabase. The full code, with tests, is in [supabase-multitenant-saas](https://github.com/AlexandreCavalcantee/supabase-multitenant-saas).

## 1. Signatures: only accept what the provider signed

A webhook URL is public. Anyone can `POST` that charge `ch_123` was paid. The defense is for the provider to sign the body with a shared secret, and for you to verify it before doing anything else.

I use the same format as Stripe: `t=<timestamp>,v1=<hmac>`, where the HMAC-SHA256 covers `"<timestamp>.<raw body>"`. Three details matter:

- **Verify the raw body**, before `JSON.parse`. Re-serializing JSON changes whitespace and key order, and the signature won't match.
- **The timestamp is part of the signed message**, so it can't be swapped. That lets you reject anything older than 5 minutes and blocks replaying a captured request.
- **Compare in constant time.** A regular comparison stops at the first different character, and the response time leaks how much of the signature was right.

```ts
const check = await verify(req.headers.get("x-signature"), body, secrets);
if (!check.ok) return json({ error: "invalid signature", reason: check.reason }, 401);
```

`secrets` is a list: while rotating, the old and the new secret are both valid, with no downtime window.

## 2. Idempotency: the same event is applied exactly once

Providers deliver *at least once*. If you answered slowly, they retry. If the network dropped after your commit, they retry. So the question isn't *whether* a duplicate will arrive, it's *what happens when it does*.

The fix is to use the event id as an idempotency key, inside the same transaction that applies the effect:

```sql
insert into inbound_events (id, type, payload)
values (p_event_id, p_type, p_payload)
on conflict (id) do nothing;

if not found then
  return 'duplicate';   -- already handled, do nothing
end if;

-- everything below runs exactly once per event
```

If two retries arrive at the same moment, the primary key serializes them: the second one waits for the first to finish and ends up as `duplicate`. And since it all lives in one `plpgsql` function, either the event is recorded **and** the invoice is paid, or nothing happens.

While I'm in there I also check the amount: if the event says someone paid $0.01 on a $100 invoice, the outcome is `amount_mismatch` and the invoice stays open.

## 3. Outbox: the customer notification is never lost

Now the other direction. The invoice was paid and your customer (the tenant) wants an `invoice.paid` webhook. The naive way is to run the `UPDATE` and then a `fetch`. But if the process dies between the two, the database says "paid" and nobody was told.

The *transactional outbox* pattern fixes this. A trigger writes the event to a `webhook_deliveries` table **in the same transaction** as the change. If the transaction commits, the notification exists. If it rolls back, it's gone too.

A separate worker does the sending. The parts that matter:

- **`FOR UPDATE SKIP LOCKED`** to claim deliveries: two workers running at once never grab the same row, and neither waits for the other.
- **A lease instead of a forever-"sending" status**: claiming a delivery sets `next_attempt_at = now() + 5 min`. If the worker dies mid-flight, the row becomes available again on its own.
- **Exponential backoff**: 30s, 1m, 2m, 4m… up to 6h. After 8 attempts the delivery goes `dead`, and an admin can requeue it.
- **Each endpoint has its own secret**, and the payload is signed with the same HMAC scheme from step 1.

In Supabase, the worker is an Edge Function, and what wakes it up every minute is Postgres itself, with `pg_cron` + `pg_net`. There's no server to babysit.

## What this guarantees in practice

| Situation | Outcome |
| --- | --- |
| Unsigned or forged request | `401`, nothing is stored |
| Captured request replayed later | rejected by the timestamp |
| Provider resends the same event | `duplicate`, effect applied once |
| Paid amount differs from the invoice | `amount_mismatch`, invoice stays open |
| Worker crashes mid-delivery | lease expires, delivery resumes |
| Customer endpoint is down | backoff retries, then dead-letter |

Delivery to the customer is still *at least once*. That's why every webhook carries an `x-webhook-id` that is stable across attempts, and the consumer should dedupe on it. It's the same contract as the inbound side, with the roles swapped.

## Testing it for real

Every one of these guarantees is covered by pgTAP tests running in CI: tenant isolation, replays, wrong amounts, backoff and dead-lettering. There's also a script that plays the payment provider and a receiver that fails half the time on purpose, so you can watch the retries happen.

If you work with payments and still treat a webhook as "receive and `UPDATE`", the [repository](https://github.com/AlexandreCavalcantee/supabase-multitenant-saas) is worth a look.
