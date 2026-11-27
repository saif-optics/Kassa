// Раскладка вкладок без дыр: каждый блок — явный прямоугольник в сетке 12 колонок; отсутствующий блок (выключен или нет данных)
// отдаёт своё место соседям с общим полным краем (те же ряды — приоритет, потом те же колонки), пока все дыры не закроются.
// Соединения (уголки, перемычки) сохраняются только если оба участника на месте и их прямоугольники не менялись.
export type Rect = [number, number, number, number]; // колонка, ряд, ширина, высота (с нуля)
export interface LItem { id: string; r: Rect; /** прямоугольник на контейнере уже 1500 (если раскладка другая) */ rn?: Rect; on: boolean }
interface Cell { id: string; on: boolean; r: Rect; ch: boolean; dead: boolean }

const inside = (b: Rect, a: Rect, vert: boolean) => (vert ? b[1] >= a[1] && b[1] + b[3] <= a[1] + a[3] : b[0] >= a[0] && b[0] + b[2] <= a[0] + a[2]);
const overlap = (b: Rect, a: Rect, vert: boolean) => (vert ? b[1] < a[1] + a[3] && b[1] + b[3] > a[1] : b[0] < a[0] + a[2] && b[0] + b[2] > a[0]);

/** одна раскладка; absentFirst — сначала склеивать рядом стоящие отсутствующие блоки */
function solve1(items: { id: string; r: Rect; on: boolean }[], absentFirst: boolean) {
  const cs: Cell[] = items.map((i) => ({ id: i.id, on: i.on, r: [...i.r] as Rect, ch: false, dead: false }));
  const alive = () => cs.filter((c) => !c.dead);
  // два отсутствующих рядом с одинаковым краем — сливаем в один отсутствующий
  const mergeAbsent = (a: Cell) => {
    const b = alive().find((o) => o !== a && !o.on && ((o.r[1] === a.r[1] && o.r[3] === a.r[3] && (o.r[0] + o.r[2] === a.r[0] || a.r[0] + a.r[2] === o.r[0])) || (o.r[0] === a.r[0] && o.r[2] === a.r[2] && (o.r[1] + o.r[3] === a.r[1] || a.r[1] + a.r[3] === o.r[1]))));
    if (!b) return false;
    const x = Math.min(a.r[0], b.r[0]), y = Math.min(a.r[1], b.r[1]);
    b.r = [x, y, Math.max(a.r[0] + a.r[2], b.r[0] + b.r[2]) - x, Math.max(a.r[1] + a.r[3], b.r[1] + b.r[3]) - y];
    a.dead = true;
    return true;
  };
  let moved = true;
  while (moved) {
    moved = false;
    for (const a of cs) {
      if (a.on || a.dead) continue;
      // стороны: слева, справа (те же ряды), потом сверху, снизу (те же колонки)
      const sides: { vert: boolean; touch: (b: Rect) => boolean; grow: (b: Cell) => void }[] = [
        { vert: true, touch: (b) => b[0] + b[2] === a.r[0], grow: (b) => { b.r[2] += a.r[2]; } },
        { vert: true, touch: (b) => b[0] === a.r[0] + a.r[2], grow: (b) => { b.r[2] += a.r[2]; b.r[0] = a.r[0]; } },
        { vert: false, touch: (b) => b[1] + b[3] === a.r[1], grow: (b) => { b.r[3] += a.r[3]; } },
        { vert: false, touch: (b) => b[1] === a.r[1] + a.r[3], grow: (b) => { b.r[3] += a.r[3]; b.r[1] = a.r[1]; } },
      ];
      let done = absentFirst ? mergeAbsent(a) : false;
      for (const s of sides) {
        if (done) break;
        const nb = alive().filter((b) => b !== a && s.touch(b.r) && overlap(b.r, a.r, s.vert));
        if (!nb.length || nb.some((b) => !b.on || !inside(b.r, a.r, s.vert))) continue;
        const span = nb.map((b) => (s.vert ? [b.r[1], b.r[1] + b.r[3]] : [b.r[0], b.r[0] + b.r[2]])).sort((x, y) => x[0] - y[0]);
        const from = s.vert ? a.r[1] : a.r[0], to = from + (s.vert ? a.r[3] : a.r[2]);
        let at = from; for (const [x, y] of span) { if (x !== at) { at = -1; break; } at = y; }
        if (at !== to) continue;
        nb.forEach((b) => { s.grow(b); b.ch = true; });
        a.dead = true; done = true;
      }
      if (!done) done = mergeAbsent(a);
      if (done) { moved = true; break; }
    }
  }
  return { cs, ok: cs.every((c) => c.on || c.dead) };
}
const solve = (items: { id: string; r: Rect; on: boolean }[]) => { const a = solve1(items, false); return a.ok ? a : solve1(items, true); };

export interface Lay {
  /** сетка без дыр получилась; иначе вкладке нужна обычная авто-раскладка */
  ok: boolean;
  on: (id: string) => boolean;
  rect: (id: string) => Rect;
  /** колонка и ширина на контейнере уже 1500 (если отличаются от широкой раскладки) */
  narrow: (id: string) => [number, number] | undefined;
  /** соединение с партнёром сохраняется: оба на месте и не менялись */
  keep: (id: string, partner: string) => boolean;
}
export function layout(items: LItem[]): Lay {
  const w = solve(items), hasN = items.some((i) => i.rn);
  const n = hasN ? solve(items.map((i) => ({ id: i.id, r: i.rn || i.r, on: i.on }))) : null;
  const get = (s: ReturnType<typeof solve>, id: string) => s.cs.find((c) => c.id === id)!;
  return {
    ok: w.ok && (!n || n.ok),
    on: (id) => get(w, id).on,
    rect: (id) => get(w, id).r,
    narrow: (id) => { if (!n) return undefined; const r = get(n, id).r, q = get(w, id).r; return r[0] === q[0] && r[2] === q[2] ? undefined : [r[0], r[2]]; },
    keep: (id, p) => { const a = get(w, id), b = get(w, p), an = n && get(n, id), bn = n && get(n, p); return a.on && b.on && !a.ch && !b.ch && !(an && an.ch) && !(bn && bn.ch); },
  };
}
