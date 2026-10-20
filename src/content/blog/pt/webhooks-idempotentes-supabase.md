---
title: "Webhooks que não perdem nem duplicam pagamento, só com Supabase"
description: "HMAC, idempotência e outbox transacional: as três peças que fazem um fluxo de pagamento aguentar retentativa, replay e servidor fora do ar."
date: 2026-10-19
tags: ["supabase", "postgres", "webhooks", "fintech"]
translationKey: idempotent-webhooks
---

Quem trabalha com pagamento aprende rápido que o caminho feliz é a parte fácil. O difícil é o que acontece quando o provedor manda o mesmo evento duas vezes, quando alguém descobre a URL do seu webhook, ou quando o banco confirma a mudança mas o aviso para o cliente se perde no caminho.

Neste post eu mostro as três peças que uso para resolver isso, todas dentro do Supabase. O código completo, com testes, está no [supabase-multitenant-saas](https://github.com/AlexandreCavalcantee/supabase-multitenant-saas).

## 1. Assinatura: só aceite o que o provedor assinou

Uma URL de webhook é pública. Qualquer pessoa pode mandar um `POST` dizendo que a cobrança `ch_123` foi paga. A defesa é o provedor assinar o corpo com um segredo compartilhado, e você verificar antes de fazer qualquer coisa.

O formato que eu uso é o mesmo do Stripe: `t=<timestamp>,v1=<hmac>`, onde o HMAC-SHA256 cobre `"<timestamp>.<corpo cru>"`. Três detalhes importam:

- **Verifique o corpo cru**, antes de fazer `JSON.parse`. Reserializar o JSON muda espaços e ordem de chaves, e a assinatura não bate.
- **O timestamp faz parte da mensagem assinada**, então não dá para trocá-lo. Com isso você recusa mensagens com mais de 5 minutos e bloqueia replay de uma requisição capturada.
- **Compare em tempo constante.** Uma comparação comum para no primeiro caractere diferente, e o tempo de resposta vaza quanto da assinatura estava certo.

```ts
const check = await verify(req.headers.get("x-signature"), body, secrets);
if (!check.ok) return json({ error: "invalid signature", reason: check.reason }, 401);
```

`secrets` é uma lista: durante a rotação de segredo, o antigo e o novo valem ao mesmo tempo, sem janela de indisponibilidade.

## 2. Idempotência: o mesmo evento é aplicado uma vez só

Provedores entregam *pelo menos uma vez*. Se a sua resposta demorou, ele reenvia. Se a rede caiu depois do commit, ele reenvia. Então a pergunta não é *se* vai chegar duplicado, é *o que acontece quando chegar*.

A solução é usar o id do evento como chave de idempotência, dentro da mesma transação que aplica o efeito:

```sql
insert into inbound_events (id, type, payload)
values (p_event_id, p_type, p_payload)
on conflict (id) do nothing;

if not found then
  return 'duplicate';   -- já processado, não faz nada
end if;

-- daqui pra baixo roda exatamente uma vez por evento
```

Se dois reenvios chegarem ao mesmo tempo, a chave primária serializa: o segundo espera o primeiro terminar e cai no `duplicate`. E como tudo está numa função `plpgsql`, ou o evento é registrado **e** a fatura é paga, ou nada acontece.

Aproveitando que estou ali dentro, eu também confiro o valor: se o evento diz que pagaram R$ 0,01 numa fatura de R$ 100, o resultado é `amount_mismatch` e a fatura continua em aberto.

## 3. Outbox: o aviso para o cliente nunca se perde

Agora o caminho inverso. A fatura foi paga e o seu cliente (o tenant) quer receber um webhook `invoice.paid`. O jeito ingênuo é fazer o `UPDATE` e depois um `fetch`. Só que, se o processo morrer entre os dois, o banco diz "paga" e ninguém foi avisado.

O padrão *transactional outbox* resolve isso. Um trigger grava o evento numa tabela `webhook_deliveries` **na mesma transação** da mudança. Se a transação faz commit, o aviso existe. Se faz rollback, ele também some.

Quem envia é um worker separado. Os pontos importantes:

- **`FOR UPDATE SKIP LOCKED`** para pegar as entregas: dois workers rodando ao mesmo tempo nunca pegam a mesma linha, e nenhum fica esperando o outro.
- **Lease em vez de status "enviando" eterno**: ao pegar uma entrega eu marco `next_attempt_at = now() + 5 min`. Se o worker morrer no meio, a linha volta a ficar disponível sozinha.
- **Backoff exponencial**: 30s, 1min, 2min, 4min… até 6h. Depois de 8 tentativas a entrega vai para `dead`, e um admin pode reenfileirar.
- **Cada endpoint tem o próprio segredo**, e o payload sai assinado com o mesmo esquema HMAC do passo 1.

No Supabase, o worker é uma Edge Function, e quem acorda ela a cada minuto é o próprio Postgres, com `pg_cron` + `pg_net`. Não tem servidor para manter.

## O que isso garante, na prática

| Situação | Resultado |
| --- | --- |
| Requisição sem assinatura ou forjada | `401`, nada é gravado |
| Requisição capturada e reenviada depois | recusada pelo timestamp |
| Provedor reenvia o mesmo evento | `duplicate`, efeito aplicado uma vez |
| Valor do pagamento diferente da fatura | `amount_mismatch`, fatura continua aberta |
| Worker cai no meio do envio | lease expira, entrega é retomada |
| Endpoint do cliente fora do ar | retentativas com backoff, depois dead-letter |

A entrega para o cliente continua sendo *pelo menos uma vez*. Por isso cada webhook leva um `x-webhook-id` estável entre as tentativas, e o consumidor deve deduplicar por ele. É o mesmo contrato do lado de entrada, agora com os papéis invertidos.

## Testando de verdade

Todas essas garantias estão cobertas por testes pgTAP que rodam no CI: isolamento entre tenants, replay, valor errado, backoff e dead-letter. Tem também um script que faz o papel do provedor e um receptor que falha de propósito metade das vezes, para você ver as retentativas acontecendo.

Se você trabalha com pagamento e ainda trata webhook como "recebe e faz `UPDATE`", vale a pena dar uma olhada no [repositório](https://github.com/AlexandreCavalcantee/supabase-multitenant-saas).
