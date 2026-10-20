# alexandre@portfolio:~$

My personal site: an interactive terminal on top, a regular (fast, accessible, SEO-friendly) portfolio below.
Bilingual (🇧🇷 PT / 🇺🇸 EN), with a Markdown blog.

**Try it:** type `help`, `git log`, `neofetch`, `cube R U R' U'`, `sudo hire-me` or `matrix`.

## Stack

- [Astro](https://astro.build) — static output, zero JS except the terminal island
- TypeScript + Tailwind CSS 4
- Content collections for the blog (`src/content/blog/{pt,en}`)
- i18n routing (`/` = PT, `/en/` = EN) with `hreflang`, sitemap and Open Graph tags

## Highlights

- **Terminal** (`src/scripts/terminal.ts`): history (↑/↓), Tab completion, clickable shortcuts, ~30 commands.
  All output is built with `textContent`, so echoed input can never inject HTML.
- **A real Rubik's cube** (`src/scripts/cube.ts`): 54 stickers rotated in 3D; scramble it, turn it, solve it.
- **One data file** (`src/data/profile.ts`) feeds both the terminal and the static sections.
- Respects `prefers-reduced-motion`; the full content is plain HTML for people who'd rather scroll.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build to dist/
```

Writing a post: add `src/content/blog/pt/<slug>.md` and `src/content/blog/en/<slug>.md` with the same
`translationKey` so the language switch links them.
