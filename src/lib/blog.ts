import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "@/data/profile";
import { localePath } from "@/i18n/ui";

export type Post = CollectionEntry<"blog">;

export const slugOf = (post: Post) => post.id.split("/").slice(1).join("/");
export const langOf = (post: Post) => post.id.split("/")[0] as Lang;
export const postUrl = (post: Post) => localePath(langOf(post), `/blog/${slugOf(post)}/`);

export async function getPosts(lang: Lang) {
  const posts = await getCollection("blog", (p) => langOf(p) === lang && !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getTranslation(post: Post) {
  const other = langOf(post) === "pt" ? "en" : "pt";
  const posts = await getPosts(other);
  return posts.find((p) => p.data.translationKey === post.data.translationKey);
}

export const readingMinutes = (post: Post) =>
  Math.max(1, Math.round((post.body ?? "").split(/\s+/).filter(Boolean).length / 220));

export const formatDate = (date: Date, lang: Lang) =>
  date.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
