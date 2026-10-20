import { apply, FACES, isSolved, MOVE_RE, scramble, solved, type Face, type Stickers } from "./cube";

// ---------------------------------------------------------------------------
// Data handed over by Terminal.astro (already localized on the server).
// ---------------------------------------------------------------------------

type Lang = "pt" | "en";
export type TermData = {
  lang: Lang;
  altHome: string;
  person: {
    name: string;
    handle: string;
    role: string;
    location: string;
    email: string;
    github: string;
    linkedin: string;
    tagline: string;
    about: string[];
    codingSince: number;
  };
  experience: { company: string; role: string; period: string; current?: boolean; bullets: string[]; tags: string[] }[];
  education: { school: string; degree: string; period: string };
  projects: {
    slug: string;
    name: string;
    featured?: boolean;
    year: string;
    summary: string;
    highlights: string[];
    stack: string[];
    repo?: string;
    demo?: string;
  }[];
  skills: { group: string; items: string[] }[];
  certifications: string[];
  languages: string;
  posts: { title: string; url: string; date: string }[];
  resume: Record<Lang, string>;
};

const STRINGS = {
  pt: {
    welcome: "Olá! Eu sou o Alexandre — ",
    helpHint: "Digite 'help' para ver os comandos, ou só role a página. 👇",
    notFound: "comando não encontrado:",
    tryHelp: "Tente 'help'.",
    commands: "Comandos disponíveis",
    tips: "Dicas: Tab completa, ↑/↓ navega no histórico, Ctrl+L limpa.",
    open: "Abrindo",
    usage: "uso:",
    noProject: "projeto não encontrado:",
    projectsHint: "Use 'cat <projeto>' para detalhes ou 'open <projeto>' para abrir o código.",
    cubeHint: "Gire com: cube R U R' U'  ·  cube scramble embaralha  ·  cube reset resolve",
    cubeSolved: "✔ Resolvido! Você leva jeito.",
    cubeMoves: "movimentos",
    sudo: "alexandre não está no arquivo sudoers. Este incidente será reportado. 👮",
    hireTitle: "Ótima decisão. 🚀",
    hireBody: "Vamos conversar:",
    rm: "Boa tentativa. Este portfólio roda em modo somente leitura. 😉",
    crtOn: "Modo CRT ligado. Digite 'crt' de novo para desligar.",
    crtOff: "Modo CRT desligado.",
    matrix: "Acorde, Neo... (qualquer tecla para sair)",
    exit: "Não dá pra sair de um bom terminal. Mas o resto do site está logo abaixo. 👇",
    langSwitch: "Mudando para English…",
    resume: "Baixando currículo",
    cd: "Indo para",
    noSection: "diretório não encontrado:",
    coding: "programando desde os",
    years: "anos",
    hobbies: "xadrez ♟, cubo mágico 🧩",
    current: "atual",
    blogEmpty: "Nenhum post ainda.",
    descs: {
      help: "lista os comandos",
      whoami: "quem sou eu, em uma linha",
      about: "sobre mim",
      projects: "projetos (ls projects)",
      cat: "detalhes de um projeto: cat <projeto>",
      open: "abre o código de um projeto: open <projeto>",
      experience: "carreira como git log (git log)",
      skills: "minha stack",
      neofetch: "info do sistema, estilo neofetch",
      blog: "posts do blog",
      contact: "como falar comigo",
      resume: "baixa o currículo: resume [pt|en]",
      cd: "navega no site: cd about|experience|projects|blog|contact",
      lang: "troca o idioma: lang en",
      cube: "um cubo mágico de verdade 🧩",
      crt: "liga/desliga o modo monitor antigo",
      matrix: "você sabe o que faz",
      clear: "limpa a tela",
      history: "histórico de comandos",
    },
  },
  en: {
    welcome: "Hi! I'm Alexandre — ",
    helpHint: "Type 'help' to see the commands, or just scroll down. 👇",
    notFound: "command not found:",
    tryHelp: "Try 'help'.",
    commands: "Available commands",
    tips: "Tips: Tab completes, ↑/↓ walks the history, Ctrl+L clears.",
    open: "Opening",
    usage: "usage:",
    noProject: "project not found:",
    projectsHint: "Use 'cat <project>' for details or 'open <project>' to see the code.",
    cubeHint: "Turn it with: cube R U R' U'  ·  cube scramble mixes  ·  cube reset solves",
    cubeSolved: "✔ Solved! Nice hands.",
    cubeMoves: "moves",
    sudo: "alexandre is not in the sudoers file. This incident will be reported. 👮",
    hireTitle: "Great call. 🚀",
    hireBody: "Let's talk:",
    rm: "Nice try. This portfolio is mounted read-only. 😉",
    crtOn: "CRT mode on. Type 'crt' again to turn it off.",
    crtOff: "CRT mode off.",
    matrix: "Wake up, Neo... (press any key to exit)",
    exit: "You can't leave a good terminal. But the rest of the site is right below. 👇",
    langSwitch: "Switching to Português…",
    resume: "Downloading resume",
    cd: "Going to",
    noSection: "no such directory:",
    coding: "coding since age",
    years: "",
    hobbies: "chess ♟, Rubik's cube 🧩",
    current: "current",
    blogEmpty: "No posts yet.",
    descs: {
      help: "list commands",
      whoami: "who I am, in one line",
      about: "about me",
      projects: "projects (ls projects)",
      cat: "project details: cat <project>",
      open: "open a project's code: open <project>",
      experience: "career as a git log (git log)",
      skills: "my stack",
      neofetch: "system info, neofetch style",
      blog: "blog posts",
      contact: "how to reach me",
      resume: "download my resume: resume [pt|en]",
      cd: "navigate the site: cd about|experience|projects|blog|contact",
      lang: "switch language: lang pt",
      cube: "a real Rubik's cube 🧩",
      crt: "toggle old-monitor mode",
      matrix: "you know what it does",
      clear: "clear the screen",
      history: "command history",
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Output primitives. Everything goes through textContent: user input is
// echoed back, so nothing here ever touches innerHTML.
// ---------------------------------------------------------------------------

type Seg = string | { text: string; cls?: string; color?: string; tile?: string; href?: string; download?: boolean };

const COLOR: Record<string, string> = {
  green: "text-green",
  purple: "text-purple",
  cyan: "text-cyan",
  yellow: "text-yellow",
  pink: "text-pink",
  red: "text-red",
  dim: "text-dim",
  faint: "text-faint",
  bold: "font-bold text-white",
};
const c = (cls: keyof typeof COLOR, text: string): Seg => ({ text, cls: COLOR[cls] });
const link = (text: string, href: string, download = false): Seg => ({ text, href, download });

const STICKER: Record<Face, string> = {
  U: "#f5f5f5",
  R: "#e5484d",
  F: "#30a46c",
  D: "#ffd23f",
  L: "#f76b15",
  B: "#3e63dd",
};

const SECTIONS = ["about", "experience", "projects", "blog", "contact"] as const;

export class Terminal {
  private out: HTMLElement;
  private input: HTMLInputElement;
  private screen: HTMLElement;
  private d: TermData;
  private s: (typeof STRINGS)[Lang];
  private history: string[] = [];
  private hIdx = 0;
  private cube: Stickers = solved();
  private cubeMoves = 0;
  private busy = false;
  private commands: Record<string, { run: (args: string[]) => void | Promise<void>; hidden?: boolean }>;

  constructor(root: HTMLElement, data: TermData) {
    this.d = data;
    this.s = STRINGS[data.lang];
    this.out = root.querySelector("[data-out]")!;
    this.input = root.querySelector("[data-input]")!;
    this.screen = root.querySelector("[data-screen]")!;

    this.commands = {
      help: { run: () => this.help() },
      whoami: { run: () => this.print([c("green", this.d.person.name), " — ", this.d.person.role]) },
      about: { run: () => this.about() },
      projects: { run: () => this.projects() },
      ls: { run: (a) => this.ls(a), hidden: true },
      cat: { run: (a) => this.cat(a) },
      open: { run: (a) => this.open(a) },
      experience: { run: () => this.gitLog() },
      git: { run: (a) => (a[0] === "log" ? this.gitLog() : this.print([`git: '${a.join(" ")}' 🤷`])), hidden: true },
      skills: { run: () => this.skills() },
      stack: { run: () => this.skills(), hidden: true },
      neofetch: { run: () => this.neofetch() },
      blog: { run: () => this.blog() },
      contact: { run: () => this.contact() },
      resume: { run: (a) => this.resume(a) },
      cd: { run: (a) => this.cd(a) },
      lang: { run: (a) => this.lang(a) },
      cube: { run: (a) => this.cubeCmd(a) },
      crt: { run: () => this.crt() },
      matrix: { run: () => this.matrix() },
      clear: { run: () => this.clear() },
      history: { run: () => this.history.forEach((h, i) => this.print([c("faint", String(i + 1).padStart(3)), "  ", h])) },
      pwd: { run: () => this.print([`/home/${this.d.person.handle}`]), hidden: true },
      date: { run: () => this.print([new Date().toString()]), hidden: true },
      echo: { run: (a) => this.print([a.join(" ")]), hidden: true },
      sudo: { run: (a) => this.sudo(a), hidden: true },
      hire: { run: () => this.hire(), hidden: true },
      rm: { run: () => this.print([c("yellow", this.s.rm)]), hidden: true },
      exit: { run: () => this.exit(), hidden: true },
      vim: { run: () => this.print([c("dim", ":q! — you're welcome.")]), hidden: true },
    };

    root.addEventListener("click", (e) => {
      // Don't steal focus while the visitor is selecting text or clicking a link.
      if ((e.target as HTMLElement).closest("a, button") || window.getSelection()?.toString()) return;
      this.input.focus({ preventScroll: true });
    });
    this.input.addEventListener("keydown", (e) => this.onKey(e));
    root.querySelectorAll<HTMLButtonElement>("[data-cmd]").forEach((b) =>
      b.addEventListener("click", () => this.typeAndRun(b.dataset.cmd!))
    );
  }

  // ----- lifecycle ----------------------------------------------------------

  async boot() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem("booted") === "1";
      sessionStorage.setItem("booted", "1");
    } catch { /* private mode: just boot */ }

    const lines: Seg[][] = [
      [c("green", "[  OK  ]"), " Mounting /home/", this.d.person.handle],
      [c("green", "[  OK  ]"), " Starting portfolio.service"],
      [
        c("green", "[  OK  ]"),
        ` Loaded ${plural(this.d.projects.length, "project")}, ${plural(this.d.experience.length, "job")}, ${plural(this.d.posts.length, "post")}`,
      ],
    ];
    const fast = reduce || seen;
    this.busy = true;
    for (const l of lines) {
      this.print(l);
      if (!fast) await sleep(220);
    }
    this.busy = false;
    this.print([]);
    this.print([this.s.welcome, c("green", this.d.person.role), "."]);
    this.print([c("dim", this.d.person.tagline)]);
    this.print([c("dim", this.s.helpHint)]);
    this.print([]);

    // On roomy screens, fill the empty terminal with something worth looking at.
    if (matchMedia("(pointer: fine) and (min-width: 768px)").matches) await this.typeAndRun("neofetch");
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = this.input.value;
      this.input.value = "";
      this.run(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.hIdx > 0) this.input.value = this.history[--this.hIdx] ?? "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.hIdx = Math.min(this.hIdx + 1, this.history.length);
      this.input.value = this.history[this.hIdx] ?? "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      this.clear();
    } else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) {
      this.echo(this.input.value + "^C");
      this.input.value = "";
    }
  }

  private async typeAndRun(cmd: string) {
    if (this.busy) return;
    this.busy = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.input.value = "";
    for (const ch of cmd) {
      this.input.value += ch;
      if (!reduce) await sleep(28);
    }
    this.busy = false;
    this.input.value = "";
    await this.run(cmd);
    this.input.focus({ preventScroll: true });
  }

  async run(raw: string) {
    const line = raw.trim();
    this.echo(raw);
    if (!line) return;
    this.history.push(line);
    this.hIdx = this.history.length;

    const [name, ...args] = line.split(/\s+/);
    const cmd = this.commands[name.toLowerCase()];
    if (!cmd) {
      this.print([c("red", `${this.s.notFound} ${name}`), ". ", c("dim", this.s.tryHelp)]);
      return;
    }
    await cmd.run(args);
  }

  private complete() {
    const value = this.input.value;
    const parts = value.split(/\s+/);
    let options: string[];
    if (parts.length <= 1) options = Object.keys(this.commands).filter((k) => !this.commands[k].hidden);
    else if (["cat", "open"].includes(parts[0])) options = this.d.projects.map((p) => p.slug);
    else if (parts[0] === "cd") options = [...SECTIONS];
    else if (parts[0] === "resume" || parts[0] === "lang") options = ["pt", "en"];
    else return;

    const prefix = parts[parts.length - 1];
    const matches = options.filter((o) => o.startsWith(prefix));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      this.input.value = parts.join(" ") + " ";
    } else if (matches.length > 1) {
      this.echo(value);
      this.print([c("dim", matches.join("   "))]);
    }
  }

  // ----- output -------------------------------------------------------------

  private print(segs: Seg[]): void {
    const div = document.createElement("div");
    div.className = "min-h-[1.5em] whitespace-pre-wrap break-words";
    for (const seg of segs) div.append(this.node(seg));
    this.out.append(div);
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  private node(seg: Seg): Node {
    if (typeof seg === "string") return document.createTextNode(seg);
    if (seg.href) {
      const a = document.createElement("a");
      a.href = seg.href;
      a.textContent = seg.text;
      a.className = `${seg.cls ?? "text-cyan"} underline decoration-current/40 underline-offset-4 hover:decoration-current`;
      if (seg.download) a.setAttribute("download", "");
      else if (/^https?:/.test(seg.href)) Object.assign(a, { target: "_blank", rel: "noopener noreferrer" });
      return a;
    }
    const span = document.createElement("span");
    span.textContent = seg.text;
    if (seg.cls) span.className = seg.cls;
    if (seg.color) span.style.color = seg.color;
    if (seg.tile) {
      // A colored square that lines up with the monospace grid (2 columns wide).
      // Exactly 2ch wide so tiles stay on the monospace grid and the cube net lines up.
      span.className = "inline-block h-[1.05em] w-[2ch] translate-y-[0.15em] rounded-[3px] align-baseline";
      span.style.backgroundColor = seg.tile;
      span.setAttribute("aria-hidden", "true");
    }
    return span;
  }

  private echo(raw: string) {
    this.print([c("green", `${this.d.person.handle}@portfolio`), c("faint", ":"), c("purple", "~"), c("faint", "$ "), raw]);
  }

  private clear() {
    this.out.replaceChildren();
  }

  // ----- commands -----------------------------------------------------------

  private help() {
    this.print([c("bold", this.s.commands)]);
    for (const [name, desc] of Object.entries(this.s.descs)) {
      this.print(["  ", c("cyan", name.padEnd(12)), c("dim", desc)]);
    }
    this.print([]);
    this.print([c("faint", this.s.tips)]);
  }

  private about() {
    for (const p of this.d.person.about) {
      this.print([p]);
      this.print([]);
    }
  }

  private ls(args: string[]) {
    if (args[0]?.replace(/\/$/, "") === "projects") return this.projects();
    this.print([
      c("purple", "about/  experience/  projects/  blog/"),
      "  ",
      c("green", "resume.pdf"),
      "  ",
      "contact.txt",
    ]);
  }

  private projects() {
    for (const p of this.d.projects) {
      this.print([
        c("faint", p.year + "  "),
        p.featured ? c("yellow", "★ ") : "  ",
        c("cyan", p.slug.padEnd(27)),
        c("dim", p.stack.slice(0, 3).join(", ")),
      ]);
    }
    this.print([]);
    this.print([c("faint", this.s.projectsHint)]);
  }

  private findProject(q?: string) {
    if (!q) return undefined;
    const k = q.toLowerCase();
    return this.d.projects.find((p) => p.slug === k || p.slug.startsWith(k) || p.name.toLowerCase() === k);
  }

  private cat(args: string[]) {
    if (args[0] === "about.txt") return this.about();
    if (args[0] === "contact.txt") return this.contact();
    const p = this.findProject(args[0]);
    if (!p) {
      this.print([c("red", args[0] ? `${this.s.noProject} ${args[0]}` : `${this.s.usage} cat <project>`)]);
      return;
    }
    this.print([c("bold", p.name), c("faint", `  (${p.year})`)]);
    this.print([p.summary]);
    for (const h of p.highlights) this.print([c("purple", "  ▸ "), h]);
    this.print([c("dim", "  stack: "), p.stack.join(" · ")]);
    const links: Seg[] = [];
    if (p.repo) links.push(c("dim", "  repo: "), link(p.repo.replace("https://", ""), p.repo));
    if (p.demo) links.push(c("dim", "   demo: "), link(p.demo.replace("https://", ""), p.demo));
    if (links.length) this.print(links);
  }

  private open(args: string[]) {
    const p = this.findProject(args[0]);
    const url = p?.repo ?? p?.demo;
    if (!p || !url) {
      this.print([c("red", args[0] ? `${this.s.noProject} ${args[0]}` : `${this.s.usage} open <project>`)]);
      return;
    }
    this.print([c("dim", `${this.s.open} `), link(url, url)]);
    window.open(url, "_blank", "noopener");
  }

  private gitLog() {
    const commits = [...this.d.experience];
    commits.forEach((job, i) => {
      const hash = hashOf(job.company + job.role);
      const refs: Seg[] = job.current
        ? [c("yellow", "("), c("cyan", "HEAD -> main"), c("yellow", ") ")]
        : [];
      this.print([c("green", "* "), c("yellow", hash + " "), ...refs, c("bold", job.role), " @ ", job.company]);
      this.print([c("green", "| "), c("faint", "  " + job.period)]);
      for (const b of job.bullets) this.print([c("green", "| "), c("dim", "  – " + b)]);
      if (i < commits.length - 1) this.print([c("green", "|")]);
    });
    this.print([c("green", "|")]);
    this.print([
      c("green", "* "),
      c("yellow", hashOf(this.d.education.school) + " "),
      c("bold", this.d.education.degree),
      " @ iCEV ",
      c("faint", `(${this.d.education.period})`),
    ]);
    this.print([
      c("green", "* "),
      c("yellow", "0000001 "),
      c("yellow", "("),
      c("purple", "tag: v0.1"),
      c("yellow", ") "),
      this.d.lang === "pt" ? "init: primeiro programa em Scratch, aos 14 anos" : "init: first Scratch program, at age 14",
    ]);
  }

  private skills() {
    for (const g of this.d.skills) this.print([c("purple", g.group.padEnd(20)), g.items.join(" · ")]);
  }

  private neofetch() {
    const p = this.d.person;
    // A scrambled cube face as the "distro logo".
    const logo = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => FACES[Math.floor(Math.random() * 6)]));
    const info: Seg[][] = [
      [c("green", p.handle), "@", c("green", "portfolio")],
      [c("faint", "─".repeat(18))],
      [c("purple", "OS: "), "Arch Linux (btw)"],
      [c("purple", "Role: "), p.role],
      [c("purple", "Work: "), this.d.experience.find((e) => e.current)?.company ?? "—"],
      [c("purple", "Stack: "), "React, TS, Supabase, Deno, Spring"],
      [c("purple", "Uptime: "), `${this.s.coding} ${p.codingSince}${this.s.years ? " " + this.s.years : ""}`],
      [c("purple", "Location: "), p.location],
      [c("purple", "Hobbies: "), this.s.hobbies],
    ];
    const rows = Math.max(info.length, 7);
    for (let r = 0; r < rows; r++) {
      const left: Seg[] = [];
      const faceRow = r - 2;
      if (faceRow >= 0 && faceRow < 3) {
        left.push("  ");
        for (const f of logo[faceRow]) left.push({ text: "", tile: STICKER[f] }, " ");
        left.push("   ");
      } else left.push(" ".repeat(14));
      this.print([...left, ...(info[r] ?? [])]);
    }
  }

  private blog() {
    if (!this.d.posts.length) return this.print([c("dim", this.s.blogEmpty)]);
    for (const p of this.d.posts) this.print([c("faint", p.date + "  "), link(p.title, p.url, false)]);
  }

  private contact() {
    const p = this.d.person;
    this.print([c("purple", "email    "), link(p.email, `mailto:${p.email}`)]);
    this.print([c("purple", "linkedin "), link(p.linkedin.replace("https://www.", ""), p.linkedin)]);
    this.print([c("purple", "github   "), link(p.github.replace("https://", ""), p.github)]);
  }

  private resume(args: string[]) {
    const lang = (args[0] === "pt" || args[0] === "en" ? args[0] : this.d.lang) as Lang;
    const href = this.d.resume[lang];
    this.print([c("dim", `${this.s.resume} (${lang.toUpperCase()}) → `), link(href.split("/").pop()!, href, true)]);
    const a = document.createElement("a");
    a.href = href;
    a.download = "";
    a.click();
  }

  private cd(args: string[]) {
    const target = (args[0] ?? "").replace(/^\.?\/?|\/$/g, "");
    if (!target || target === "~") return;
    if (!(SECTIONS as readonly string[]).includes(target)) {
      this.print([c("red", `cd: ${this.s.noSection} ${args[0]}`)]);
      return;
    }
    this.print([c("dim", `${this.s.cd} `), c("purple", `./${target}`)]);
    if (target === "blog") {
      location.href = this.d.lang === "pt" ? "/blog/" : "/en/blog/";
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }

  private lang(args: string[]) {
    const target = args[0];
    if (target !== "pt" && target !== "en") return this.print([c("dim", `${this.s.usage} lang pt|en`)]);
    if (target === this.d.lang) return;
    this.print([c("dim", this.s.langSwitch)]);
    location.href = this.d.altHome;
  }

  private cubeCmd(args: string[]) {
    const sub = args[0]?.toLowerCase();
    if (sub === "reset") {
      this.cube = solved();
      this.cubeMoves = 0;
    } else if (!sub || sub === "scramble") {
      const seq = scramble();
      this.cube = seq.reduce(apply, solved());
      this.cubeMoves = 0;
      this.print([c("dim", "scramble: "), c("yellow", seq.join(" "))]);
    } else {
      const moves = args.join(" ").toUpperCase().replace(/’/g, "'").split(/\s+/).filter(Boolean);
      const bad = moves.find((m) => !MOVE_RE.test(m));
      if (bad) return this.print([c("red", `cube: invalid move '${bad}'`), c("dim", "  (U D L R F B, ' or 2)")]);
      this.cube = moves.reduce(apply, this.cube);
      this.cubeMoves += moves.length;
    }
    this.drawCube();
    if (sub !== "reset" && sub !== "scramble" && sub && isSolved(this.cube)) {
      this.print([c("green", this.s.cubeSolved), c("dim", ` (${this.cubeMoves} ${this.s.cubeMoves})`)]);
    } else {
      this.print([c("faint", this.s.cubeHint)]);
    }
  }

  private drawCube() {
    const s = this.cube;
    const row = (f: Face, r: number): Seg[] =>
      s[f].slice(r * 3, r * 3 + 3).flatMap((x): Seg[] => [{ text: "", tile: STICKER[x] }, " "]);
    // Each sticker is 2ch + 1 space; the middle row starts with 1 space, so U/D sit
    // above F after 1 + 9 (the L face) + 1 (gap) columns.
    const pad = " ".repeat(11);
    const lines: Seg[][] = [];
    for (let r = 0; r < 3; r++) lines.push([pad, ...row("U", r)]);
    for (let r = 0; r < 3; r++) lines.push([" ", ...(["L", "F", "R", "B"] as Face[]).flatMap((f) => [...row(f, r), " "])]);
    for (let r = 0; r < 3; r++) lines.push([pad, ...row("D", r)]);
    this.print([]);
    for (const l of lines) this.print(l);
    this.print([]);
  }

  private crt() {
    const on = document.documentElement.classList.toggle("crt");
    try {
      localStorage.setItem("crt", on ? "1" : "0");
    } catch { /* ignore */ }
    this.print([c("green", on ? this.s.crtOn : this.s.crtOff)]);
  }

  private matrix() {
    this.print([c("green", this.s.matrix)]);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fixed inset-0 z-50 cursor-pointer";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    const ctx = canvas.getContext("2d")!;
    const size = 16;
    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };
    resize();
    const drops = Array.from({ length: Math.ceil(innerWidth / size) }, () => Math.random() * -50);
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789SUPABASEDENOREACT";
    let raf = 0;
    const tick = () => {
      ctx.fillStyle = "rgba(11, 14, 20, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#3fb950";
      ctx.font = `${size}px "JetBrains Mono Variable", monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
        drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    const stop = () => {
      cancelAnimationFrame(raf);
      canvas.remove();
      removeEventListener("keydown", stop);
      removeEventListener("resize", resize);
      clearTimeout(timer);
      this.input.focus({ preventScroll: true });
    };
    const timer = setTimeout(stop, 8000);
    addEventListener("resize", resize);
    canvas.addEventListener("click", stop);
    setTimeout(() => addEventListener("keydown", stop, { once: true }), 50);
  }

  private sudo(args: string[]) {
    if (args.join(" ").toLowerCase().replace(/[-_]/g, " ") === "hire me") return this.hire();
    this.print([c("red", this.s.sudo)]);
  }

  private hire() {
    this.print([c("green", this.s.hireTitle)]);
    this.print([this.s.hireBody]);
    this.contact();
  }

  private exit() {
    this.print([c("dim", this.s.exit)]);
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hashOf(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}
