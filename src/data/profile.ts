// Single source of truth for the site's content. Everything the terminal
// prints and every static section is rendered from here.

export type Lang = "pt" | "en";
type L = Record<Lang, string>;

export const person = {
  name: "Alexandre Cavalcante",
  fullName: "Alexandre Medeiros Cavalcante",
  handle: "alexandre",
  role: { pt: "Desenvolvedor Full Stack", en: "Full Stack Developer" } satisfies L,
  location: { pt: "Teresina, PI — Brasil", en: "Teresina, Brazil" } satisfies L,
  email: "alexandrecavalcante.contato@gmail.com",
  github: "https://github.com/AlexandreCavalcantee",
  linkedin: "https://www.linkedin.com/in/alexandrecavalcantee/",
  codingSince: 14,
  tagline: {
    pt: "Construo SaaS que movimentam dinheiro e dados jurídicos: React e TypeScript no front, Supabase, Deno e Spring Boot no back.",
    en: "I build SaaS products that move money and legal data: React and TypeScript on the front, Supabase, Deno and Spring Boot on the back.",
  } satisfies L,
  about: {
    pt: [
      "Sou desenvolvedor Full Stack na Prudêncio Advogados, onde trabalho no WhatsJud, um CRM jurídico omnichannel com IA, e no QuitePay, uma fintech white-label de crédito e cobrança.",
      "Gosto da parte do sistema que não pode falhar: isolamento entre clientes com RLS, webhooks assinados e idempotentes, conciliação automática de pagamentos. Antes disso, passei pela MedSafe, de estagiário a Júnior, com Java, Spring Boot e Angular.",
      "Programo desde os 14 anos e estudo Engenharia de Software no iCEV. Fora do código, jogo xadrez e resolvo cubo mágico — os dois treinam o mesmo músculo que debugar.",
    ],
    en: [
      "I'm a Full Stack Developer at Prudêncio Advogados, working on WhatsJud, an AI-powered omnichannel legal CRM, and QuitePay, a white-label credit and collections fintech.",
      "I like the parts of a system that can't fail: tenant isolation with RLS, signed and idempotent webhooks, automatic payment reconciliation. Before that I was at MedSafe, from intern to Junior, working with Java, Spring Boot and Angular.",
      "I've been coding since I was 14 and study Software Engineering at iCEV. Away from the keyboard I play chess and solve Rubik's cubes — both train the same muscle as debugging.",
    ],
  } satisfies Record<Lang, string[]>,
};

export type Job = {
  company: string;
  role: L;
  period: L;
  current?: boolean;
  bullets: Record<Lang, string[]>;
  tags: string[];
};

export const experience: Job[] = [
  {
    company: "Prudêncio Advogados",
    role: { pt: "Desenvolvedor Full Stack", en: "Full Stack Developer" },
    period: { pt: "abr 2026 — atual", en: "Apr 2026 — present" },
    current: true,
    bullets: {
      pt: [
        "Sustentação e evolução do WhatsJud (CRM/BI jurídico omnichannel com IA) e do QuitePay (fintech white-label de crédito e cobrança).",
        "QuitePay: emissão de CCB, liquidação de parcelas e Open Finance (Pix ITP) via Celcoin, em arquitetura multi-tenant com RLS e Edge Functions em Deno.",
        "Webhooks assinados (HMAC) com reprocessamento e auditoria via pg_cron para conciliação automática e réguas de cobrança.",
        "WhatsJud: LLMs (Gemini e Claude) para triagem e geração de peças, APIs públicas (Escavador) e roteamento de WhatsApp multi-instância.",
      ],
      en: [
        "Maintain and evolve WhatsJud (AI-powered omnichannel legal CRM/BI) and QuitePay (white-label credit and collections fintech).",
        "QuitePay: CCB issuance, installment settlement and Open Finance (Pix ITP) through Celcoin, on a multi-tenant architecture with RLS and Deno Edge Functions.",
        "HMAC-signed webhooks with reprocessing and auditing via pg_cron for automatic reconciliation and dunning.",
        "WhatsJud: LLMs (Gemini and Claude) for triage and legal document generation, public APIs (Escavador) and multi-instance WhatsApp routing.",
      ],
    },
    tags: ["React", "TypeScript", "Supabase", "Deno", "PostgreSQL", "LLMs"],
  },
  {
    company: "MedSafe",
    role: { pt: "Desenvolvedor Full Stack Júnior", en: "Junior Full Stack Developer" },
    period: { pt: "nov 2025 — abr 2026", en: "Nov 2025 — Apr 2026" },
    bullets: {
      pt: [
        "Promoção antecipada a Júnior por autonomia.",
        "APIs RESTful em Java (Spring Boot) e interfaces em Angular.",
        "Refatoração de consultas MySQL: −35% no tempo de resposta do banco.",
        "Testes unitários e de integração com JUnit.",
      ],
      en: [
        "Promoted early to Junior for high autonomy.",
        "RESTful APIs in Java (Spring Boot) and Angular interfaces.",
        "Refactored MySQL queries: −35% database response time.",
        "Unit and integration tests with JUnit.",
      ],
    },
    tags: ["Java", "Spring Boot", "Angular", "MySQL", "JUnit"],
  },
  {
    company: "MedSafe",
    role: { pt: "Estagiário Full Stack", en: "Full Stack Intern" },
    period: { pt: "mai 2025 — nov 2025", en: "May 2025 — Nov 2025" },
    bullets: {
      pt: [
        "Fluxo colaborativo no GitLab: merge requests, conflitos e code review com seniores.",
        "Rotinas ágeis (Scrum/Kanban), refinamento e estimativas.",
        "Correção de bugs no backend Java e telas dinâmicas em Angular.",
      ],
      en: [
        "GitLab collaboration flow: merge requests, conflicts and code review with seniors.",
        "Agile routines (Scrum/Kanban), refinement and estimation.",
        "Bug fixes in the Java backend and dynamic Angular screens.",
      ],
    },
    tags: ["Java", "Angular", "GitLab", "Scrum"],
  },
];

export const education = {
  school: "iCEV — Instituto de Ensino Superior",
  degree: { pt: "Bacharelado em Engenharia de Software", en: "B.Sc. in Software Engineering" } satisfies L,
  period: { pt: "conclusão prevista: dez 2027", en: "expected: Dec 2027" } satisfies L,
};

export type Project = {
  slug: string;
  name: string;
  featured?: boolean;
  year: string;
  summary: L;
  highlights: Record<Lang, string[]>;
  stack: string[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    slug: "supabase-multitenant-saas",
    name: "Supabase Multi-Tenant SaaS",
    featured: true,
    year: "2026",
    summary: {
      pt: "Backend de cobrança multi-tenant feito só com Supabase: RLS por tenant, webhooks HMAC idempotentes e outbox transacional com retentativas.",
      en: "Multi-tenant billing backend built only with Supabase: per-tenant RLS, idempotent HMAC webhooks and a transactional outbox with retries.",
    },
    highlights: {
      pt: [
        "Isolamento entre tenants e papéis (owner/admin/member) garantidos no banco",
        "Pagamentos idempotentes: o mesmo evento nunca é aplicado duas vezes",
        "Outbox com FOR UPDATE SKIP LOCKED, backoff exponencial e dead-letter",
        "pgTAP + Deno tests rodando no GitHub Actions",
      ],
      en: [
        "Tenant isolation and roles (owner/admin/member) enforced by the database",
        "Idempotent payments: the same event is never applied twice",
        "Outbox with FOR UPDATE SKIP LOCKED, exponential backoff and dead-letter",
        "pgTAP + Deno tests running on GitHub Actions",
      ],
    },
    stack: ["Supabase", "PostgreSQL", "RLS", "Deno", "pg_cron", "pgTAP"],
    repo: "https://github.com/AlexandreCavalcantee/supabase-multitenant-saas",
  },
  {
    slug: "checklist-digital",
    name: "Checklist Digital",
    featured: true,
    year: "2026",
    summary: {
      pt: "Plataforma de checklists e auditorias operacionais com planos de ação, relatórios por setor e exportação CSV.",
      en: "Operational checklists and audits platform with action plans, per-department reports and CSV export.",
    },
    highlights: {
      pt: [
        "Dashboard com status, checklists a partir de modelo e atribuição de responsáveis",
        "Relatórios com KPIs, ranking e sugestões de itens por setor",
        "API protegida por sessão Supabase em todas as rotas",
      ],
      en: [
        "Status dashboard, template-based checklists and assignees",
        "Reports with KPIs, ranking and per-department item suggestions",
        "Every API route protected by the Supabase session",
      ],
    },
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "Supabase"],
    repo: "https://github.com/AlexandreCavalcantee/Checklist-Digital",
    demo: "https://checklist-digital-n6g9.vercel.app",
  },
  {
    slug: "unitune",
    name: "UniTune",
    year: "2026",
    summary: {
      pt: "App Flutter de descoberta de músicas para uma rádio universitária, com iTunes Search API e playlists offline.",
      en: "Flutter music discovery app for a university radio, using the iTunes Search API with offline playlists.",
    },
    highlights: {
      pt: ["Arquitetura em camadas (data, domain, presentation)", "Playlists em SQLite e preferências locais"],
      en: ["Layered architecture (data, domain, presentation)", "SQLite playlists and local preferences"],
    },
    stack: ["Flutter", "Dart", "SQLite"],
    repo: "https://github.com/AlexandreCavalcantee/UniTune",
  },
  {
    slug: "unified-test-automation",
    name: "Unified Test Automation",
    year: "2026",
    summary: {
      pt: "Suítes de testes de API (Petstore) e E2E web (SauceDemo) numa única pipeline de CI.",
      en: "API (Petstore) and web E2E (SauceDemo) test suites in a single CI pipeline.",
    },
    highlights: {
      pt: ["Page Object Model e factories de payload", "Jobs paralelos no GitHub Actions com relatório HTML"],
      en: ["Page Object Model and payload factories", "Parallel GitHub Actions jobs with HTML reports"],
    },
    stack: ["Python", "pytest", "Selenium", "GitHub Actions"],
    repo: "https://github.com/AlexandreCavalcantee/unified-test-automation",
  },
  {
    slug: "dijkstra",
    name: "Dijkstra Study",
    year: "2026",
    summary: {
      pt: "Dijkstra do zero com min-heap indexado vs. versão O(V²), com testes e benchmark empírico.",
      en: "Dijkstra from scratch with an indexed min-heap vs. the O(V²) version, with tests and an empirical benchmark.",
    },
    highlights: {
      pt: ["Min-heap binário indexado implementado do zero", "Benchmark com gráficos e notebook para apresentação"],
      en: ["Indexed binary min-heap implemented from scratch", "Benchmark with charts and a presentation notebook"],
    },
    stack: ["Python", "Algorithms", "Jupyter"],
    repo: "https://github.com/AlexandreCavalcantee/dijkstra-algorithm-study",
  },
];

export const skills: { group: L; items: string[] }[] = [
  { group: { pt: "Linguagens", en: "Languages" }, items: ["TypeScript", "JavaScript", "Java", "SQL", "Python"] },
  {
    group: { pt: "Frontend & Mobile", en: "Frontend & Mobile" },
    items: ["React", "Next.js", "Angular", "Tailwind", "TanStack Query", "shadcn/ui", "Capacitor", "Flutter"],
  },
  {
    group: { pt: "Backend & Dados", en: "Backend & Data" },
    items: ["Supabase", "Deno", "Node.js", "Spring Boot", "FastAPI", "PostgreSQL", "MySQL"],
  },
  {
    group: { pt: "Infra & Ferramentas", en: "Infra & Tooling" },
    items: ["Git", "GitHub Actions", "GitLab CI", "Docker", "Linux", "AWS", "OCI", "Vercel", "Railway"],
  },
];

export const certifications = [
  "Oracle Cloud Infrastructure (OCI)",
  "Oracle AI with ML in Java",
  "AWS Academy — Data Engineering, ML for NLP, Cloud Foundations",
  "Red Hat Linux Fundamentals",
];

export const languages: L = {
  pt: "Português (nativo) · Inglês C1 (Cambridge) · Espanhol B1",
  en: "Portuguese (native) · English C1 (Cambridge) · Spanish B1",
};

export const resume: L = {
  pt: "/resume/Alexandre_Cavalcante_Curriculo.pdf",
  en: "/resume/Alexandre_Cavalcante_Resume_EN.pdf",
};
