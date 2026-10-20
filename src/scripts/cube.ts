// A tiny but real 3x3 Rubik's cube: 54 stickers, moves applied by rotating
// sticker positions in 3D. Same model as the one behind the GitHub profile.

type Vec = [number, number, number];
export type Face = "U" | "R" | "F" | "D" | "L" | "B";
export type Stickers = Record<Face, Face[]>;

export const FACES: Face[] = ["U", "R", "F", "D", "L", "B"];

// Outward normal, then the "right" and "down" directions of each face as drawn in the net.
const GEOMETRY: Record<Face, [Vec, Vec, Vec]> = {
  U: [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
  R: [[1, 0, 0], [0, 0, -1], [0, -1, 0]],
  F: [[0, 0, 1], [1, 0, 0], [0, -1, 0]],
  D: [[0, -1, 0], [1, 0, 0], [0, 0, -1]],
  L: [[-1, 0, 0], [0, 0, 1], [0, -1, 0]],
  B: [[0, 0, -1], [-1, 0, 0], [0, -1, 0]],
};

const add = (...vs: Vec[]): Vec => vs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]);
const mul = (v: Vec, k: number): Vec => [v[0] * k, v[1] * k, v[2] * k];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const eq = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

function stickerPos(face: Face, i: number): Vec {
  const [n, r, d] = GEOMETRY[face];
  return add(n, mul(r, (i % 3) - 1), mul(d, Math.floor(i / 3) - 1));
}

function locate(pos: Vec, normal: Vec): [Face, number] {
  for (const f of FACES) {
    if (!eq(GEOMETRY[f][0], normal)) continue;
    for (let i = 0; i < 9; i++) if (eq(stickerPos(f, i), pos)) return [f, i];
  }
  throw new Error("sticker not found");
}

function quarterTurn(s: Stickers, face: Face): Stickers {
  const axis = GEOMETRY[face][0];
  // Clockwise seen from outside = -90° around the outward normal.
  const rot = (v: Vec) => add(mul(cross(axis, v), -1), mul(axis, dot(axis, v)));
  const next = Object.fromEntries(FACES.map((f) => [f, [...s[f]]])) as Stickers;
  for (const f of FACES) {
    for (let i = 0; i < 9; i++) {
      const pos = stickerPos(f, i);
      if (dot(pos, axis) !== 1) continue;
      const [nf, ni] = locate(rot(pos), rot(GEOMETRY[f][0]));
      next[nf][ni] = s[f][i];
    }
  }
  return next;
}

export const MOVE_RE = /^([URFDLB])(['2]?)$/;

export function apply(s: Stickers, move: string): Stickers {
  const m = MOVE_RE.exec(move);
  if (!m) throw new Error(`invalid move: ${move}`);
  const turns = m[2] === "" ? 1 : m[2] === "2" ? 2 : 3;
  for (let k = 0; k < turns; k++) s = quarterTurn(s, m[1] as Face);
  return s;
}

export const solved = (): Stickers => Object.fromEntries(FACES.map((f) => [f, Array(9).fill(f)])) as Stickers;

export const isSolved = (s: Stickers) => FACES.every((f) => s[f].every((c) => c === s[f][4]));

export function scramble(length = 20): string[] {
  const moves: string[] = [];
  let last = "";
  while (moves.length < length) {
    const face = FACES[Math.floor(Math.random() * 6)];
    if (face === last) continue;
    moves.push(face + ["", "'", "2"][Math.floor(Math.random() * 3)]);
    last = face;
  }
  return moves;
}
