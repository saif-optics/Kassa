// Демо-отметки для ?demo: вымышленные сотрудники и отметки, изменения живут в памяти и в базу не уходят.
import type { AttEmp, AttEvent, AttPoint } from "./logic";

const UA_PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const UA_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130";
const faces = (n: number) => Array.from({ length: n }, () => [0]);

export const demoMem: { points: AttPoint[]; emps: AttEmp[] } = {
  points: [
    { point: "Премиум", start_time: "09:00", code: "DEMO0001" },
    { point: "Яшнабад", start_time: "09:00", code: "DEMO0002" },
    { point: "Сергели", start_time: "09:00", code: "DEMO0003" },
    { point: "C1", start_time: "09:00", code: "DEMO0004" },
  ],
  emps: [
    { id: "d1", name: "Мадина Саидова", point: "Премиум", active: true, descriptors: faces(5) },
    { id: "d2", name: "Фаррух Тошев", point: "Премиум", active: true, descriptors: faces(5) },
    { id: "d3", name: "Лола Алиева", point: "Яшнабад", active: true, descriptors: faces(5) },
    { id: "d4", name: "Камила Назарова", point: "Яшнабад", active: true, descriptors: faces(2) },
    { id: "d5", name: "Бехзод Мирзаев", point: "Сергели", active: true, descriptors: [] },
    { id: "d6", name: "Нодир Рахимов", point: "Сергели", active: true, descriptors: faces(5) },
    { id: "d7", name: "Дилноза Юсупова", point: "C1", active: true, descriptors: faces(5) },
    { id: "d8", name: "Тимур Эшонов", point: "C1", active: true, descriptors: faces(6) },
  ],
};

const iso = (day: string, hm: string) => new Date(`${day}T${hm}:00+05:00`).toISOString();
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const hh = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const dow = (day: string) => new Date(day + "T12:00:00+05:00").getUTCDay(); // 0 — воскресенье
const devOf = (pt: string) => (pt === "C1" ? UA_MAC : UA_PHONE);

/** отметки одного дня: сегодня — фиксированный набор «утро в разгаре», остальные дни — по хэшу даты */
function dayEvents(day: string, today: string): AttEvent[] {
  const out: AttEvent[] = [];
  const push = (n: number, e: { id: string; point: string }, kind: "in" | "out", hm: string, h: number) => {
    const lat = e.point === "C1" ? null : 41.3 + (h % 50) / 1000;
    out.push({ id: hash(day + e.id) % 1_000_000 * 10 + n, employee_id: e.id, point: e.point, kind, ts: iso(day, hm), score: 0.7 + (h % 16) / 100, lat, lng: lat == null ? null : 69.2 + (h % 40) / 1000, acc: lat == null ? null : 15 + (h % 40), device: devOf(e.point) });
  };
  if (day === today) {
    const fixed: Record<string, string> = { d1: "08:52", d2: "09:12", d3: "08:58", d6: "08:55", d7: "08:59", d8: "09:00" };
    for (const e of demoMem.emps) if (fixed[e.id]) push(0, e, "in", fixed[e.id], hash(e.id));
  } else if (dow(day) !== 0) {
    for (const e of demoMem.emps) {
      const h = hash(day + e.id);
      if (h % 11 === 0) continue;
      const st = 9 * 60 + ((h % 23) - 20);
      push(0, e, "in", hh(st), h);
      push(1, e, "out", hh(18 * 60 + (h % 90)), h >> 3);
    }
  }
  return out;
}

export function demoEvents(fromDay: string, toDay: string, today: string): AttEvent[] {
  const res: AttEvent[] = [];
  for (let t = +new Date(fromDay + "T12:00:00+05:00"); t <= +new Date(toDay + "T12:00:00+05:00"); t += 86400_000) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(t);
    res.push(...dayEvents(day, today));
  }
  return res.sort((a, b) => a.ts.localeCompare(b.ts));
}

/** фото-заглушка для демо: цветной силуэт */
export const demoPhoto = (id: string | number) => {
  const c = ["#8ab4f8", "#f6a97a", "#9ad7a8", "#c9a7f0", "#f2a2b8"][hash(String(id)) % 5];
  return "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${c}"/><circle cx="48" cy="37" r="16" fill="#fff" opacity=".85"/><rect x="21" y="60" width="54" height="40" rx="22" fill="#fff" opacity=".85"/></svg>`);
};
