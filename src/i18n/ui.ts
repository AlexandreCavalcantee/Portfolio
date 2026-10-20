import type { Lang } from "@/data/profile";

export const ui = {
  pt: {
    "meta.title": "Alexandre Cavalcante — Desenvolvedor Full Stack",
    "meta.description":
      "Portfólio de Alexandre Cavalcante, desenvolvedor Full Stack (React, TypeScript, Supabase, Deno, Spring Boot) em Teresina.",
    "nav.about": "sobre",
    "nav.experience": "experiência",
    "nav.projects": "projetos",
    "nav.blog": "blog",
    "nav.contact": "contato",
    "terminal.hint": "Digite um comando ou clique em um atalho:",
    "terminal.label": "Terminal interativo",
    "terminal.input": "Comando do terminal",
    "section.about": "Sobre",
    "section.experience": "Experiência",
    "section.projects": "Projetos",
    "section.skills": "Stack",
    "section.blog": "Blog",
    "section.contact": "Contato",
    "projects.repo": "código",
    "projects.demo": "demo",
    "projects.featured": "destaque",
    "education.title": "Formação",
    "certs.title": "Certificações & idiomas",
    "blog.all": "ver todos os posts",
    "blog.empty": "Nenhum post ainda.",
    "blog.back": "voltar para o blog",
    "blog.read": "min de leitura",
    "blog.title": "Blog",
    "blog.description": "Notas técnicas sobre backend, Supabase, Postgres e o que aprendo construindo SaaS.",
    "contact.text": "Quer conversar sobre uma vaga, um projeto ou trocar ideia sobre Postgres? Me chama.",
    "resume.download": "baixar currículo",
    "footer.built": "Feito com Astro e Tailwind. Código aberto no",
    "lang.switch": "English",
    "skip": "Pular para o conteúdo",
  },
  en: {
    "meta.title": "Alexandre Cavalcante — Full Stack Developer",
    "meta.description":
      "Portfolio of Alexandre Cavalcante, Full Stack Developer (React, TypeScript, Supabase, Deno, Spring Boot) based in Brazil.",
    "nav.about": "about",
    "nav.experience": "experience",
    "nav.projects": "projects",
    "nav.blog": "blog",
    "nav.contact": "contact",
    "terminal.hint": "Type a command or click a shortcut:",
    "terminal.label": "Interactive terminal",
    "terminal.input": "Terminal command",
    "section.about": "About",
    "section.experience": "Experience",
    "section.projects": "Projects",
    "section.skills": "Stack",
    "section.blog": "Blog",
    "section.contact": "Contact",
    "projects.repo": "code",
    "projects.demo": "demo",
    "projects.featured": "featured",
    "education.title": "Education",
    "certs.title": "Certifications & languages",
    "blog.all": "see all posts",
    "blog.empty": "No posts yet.",
    "blog.back": "back to the blog",
    "blog.read": "min read",
    "blog.title": "Blog",
    "blog.description": "Technical notes on backend, Supabase, Postgres and what I learn building SaaS.",
    "contact.text": "Want to talk about a role, a project or just Postgres? Reach out.",
    "resume.download": "download resume",
    "footer.built": "Built with Astro and Tailwind. Source on",
    "lang.switch": "Português",
    "skip": "Skip to content",
  },
} as const;

export type UiKey = keyof (typeof ui)["pt"];

export const t = (lang: Lang) => (key: UiKey) => ui[lang][key];

/** Path of the same page in the other language. */
export function altPath(lang: Lang, path: string): string {
  const clean = path.replace(/^\/en(?=\/|$)/, "") || "/";
  return lang === "pt" ? `/en${clean === "/" ? "/" : clean}` : clean;
}

export const localePath = (lang: Lang, path = "/") => (lang === "pt" ? path : `/en${path === "/" ? "/" : path}`);
