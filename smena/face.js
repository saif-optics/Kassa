// Общий модуль распознавания лица для киоска (index.html) и админки (admin.html).
// face-api.js 1.7.15 лежит рядом (vendor/, models/) и кэшируется service worker'ом (sw.js).
// Чистые функции (match, quality-проверки, Live) не трогают DOM — их можно гонять в Node.

let optsCache = null;
const BASE = new URL("./", import.meta.url).href;

// ---------- профиль устройства ----------
// iMac/ноутбук: SSD MobileNet v1 (точнее, WebGL тянет). Телефон/планшет: TinyFaceDetector (в 10 раз легче).
// Принудительно: ?det=ssd | ?det=tiny
const ua = navigator.userAgent || "";
export const PHONE = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform || ""));
const forced = new URLSearchParams(location.search).get("det");
export let DET = forced === "ssd" || forced === "tiny" ? forced : PHONE ? "tiny" : "ssd";
// MATCH — порог расстояния до сохранённого снимка; NEED — подряд кадров с одним человеком;
// GAP — отрыв от второго сотрудника; MINFACE — доля короткой стороны кадра; FRAME_MS — пауза между циклами
const PROF = {
  ssd: { MATCH: 0.47, NEED: 2, GAP: 0.06, MINFACE: 0.28, FRAME_MS: 60 },
  tiny: { MATCH: 0.50, NEED: 3, GAP: 0.05, MINFACE: 0.30, FRAME_MS: 90 },
};
export let CFG = PROF[DET];
// Слабый iMac: SSD дольше ~300 мс на кадр — переходим на Tiny (его веса грузятся везде)
export function useTiny() { DET = "tiny"; CFG = PROF.tiny; optsCache = null; }
export const Q = { LIGHT_MIN: 55, LIGHT_MAX: 210, SHARP_MIN: 25, MAXFACE: 0.92, CX: 0.24, CY: 0.28 };

// ---------- загрузка библиотеки и весов с прогрессом ----------
// Размеры файлов (байт) — для честного процента до начала загрузки
const SIZE = {
  lib: 1333462,
  tiny_face_detector: 193321 + 3219, ssd_mobilenetv1: 5616957 + 28233,
  face_landmark_68: 356840 + 8485, face_recognition: 6444032 + 19615,
};
let loadP = null;
export function loadFace(onProgress = () => {}) {
  return loadP ??= (async () => {
    const need = ["face_landmark_68", "face_recognition", "tiny_face_detector"]; if (DET === "ssd") need.push("ssd_mobilenetv1");
    const total = SIZE.lib + need.reduce((s, n) => s + SIZE[n], 0);
    let got = 0; const tick = n => { got += n; onProgress(Math.min(0.99, got / total)); };
    // fetch с подсчётом байт (ответ идёт через service worker/кэш, если он уже включён)
    const grab = async url => {
      const r = await fetch(url); if (!r.ok) throw new Error(url + ": " + r.status);
      if (!r.body) { const b = await r.arrayBuffer(); tick(b.byteLength); return b; }
      const rd = r.body.getReader(), parts = []; let len = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); len += value.length; tick(value.length); }
      const out = new Uint8Array(len); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
      return out.buffer;
    };
    // библиотека — один самодостаточный модуль: качаем с подсчётом байт и импортируем из blob (без второй загрузки)
    const libP = grab(BASE + "vendor/face-api.esm.js").then(b => import(URL.createObjectURL(new Blob([b], { type: "text/javascript" }))));
    const weightsP = need.map(async n => {
      const mf = await (await fetch(`${BASE}models/${n}_model-weights_manifest.json`)).json();
      const bufs = await Promise.all(mf.flatMap(g => g.paths).map(p => grab(BASE + "models/" + p)));
      const all = new Uint8Array(bufs.reduce((s, b) => s + b.byteLength, 0)); let o = 0;
      for (const b of bufs) { all.set(new Uint8Array(b), o); o += b.byteLength; }
      return { n, mf, buf: all.buffer };
    });
    const fa = await libP;
    await fa.tf.setBackend("webgl").catch(() => {});
    await fa.tf.ready();
    for (const { n, mf, buf } of await Promise.all(weightsP)) {
      const map = fa.tf.io.decodeWeights(buf, mf.flatMap(g => g.weights));
      ({ face_landmark_68: fa.nets.faceLandmark68Net, face_recognition: fa.nets.faceRecognitionNet,
         ssd_mobilenetv1: fa.nets.ssdMobilenetv1, tiny_face_detector: fa.nets.tinyFaceDetector })[n].loadFromWeightMap(map);
    }
    onProgress(1);
    return fa;
  })().catch(e => { loadP = null; throw e; });
}

// Холостой прогон всех сетей: первый вызов в WebGL компилирует шейдеры (секунды), делаем это заранее
export async function warmup(fa) {
  const c = document.createElement("canvas"); c.width = 640; c.height = 480;
  const g = c.getContext("2d"); g.fillStyle = "#777"; g.fillRect(0, 0, 640, 480);
  const f = document.createElement("canvas"); f.width = f.height = 160;
  const fg = f.getContext("2d"); for (let i = 0; i < 400; i++) { fg.fillStyle = `hsl(0 0% ${20 + Math.random() * 60}%)`; fg.fillRect(Math.random() * 160, Math.random() * 160, 12, 12); }
  const t = performance.now();
  await detect(fa, c);
  await fa.nets.faceLandmark68Net.detectLandmarks(f);
  await fa.nets.faceRecognitionNet.computeFaceDescriptor(f);
  return Math.round(performance.now() - t);
}

// ---------- детекция ----------
export async function detect(fa, frame) {
  const o = optsCache ??= DET === "ssd"
    ? new fa.SsdMobilenetv1Options({ minConfidence: 0.55, maxResults: 3 })
    : new fa.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const net = DET === "ssd" ? fa.nets.ssdMobilenetv1 : fa.nets.tinyFaceDetector;
  const list = await net.locateFaces(frame, o);
  if (!list.length) return null;
  return list.reduce((a, b) => (b.box.area > a.box.area ? b : a)); // самое крупное лицо — тот, кто у камеры
}
// Точки лица (68) и, если нужно, дескриптор — по уже найденной рамке, на том же кадре
export async function landmarks(fa, frame, det) {
  return new fa.DetectSingleFaceLandmarksTask(Promise.resolve(fa.extendWithFaceDetection({}, det)), frame, false).run();
}
export async function describeFace(fa, frame, lm) {
  const r = await new fa.ComputeSingleFaceDescriptorTask(Promise.resolve(lm), frame).run();
  return r.descriptor;
}

// ---------- качество кадра ----------
// box — {x,y,width,height} в пикселях кадра. Возвращает {ok, hint, m:{size,light,sharp,dx,dy}}
export function quality(box, fw, fh, px) {
  const m = { size: Math.max(box.width, box.height) / Math.min(fw, fh), light: px?.light ?? 128, sharp: px?.sharp ?? 99,
    dx: (box.x + box.width / 2) / fw - 0.5, dy: (box.y + box.height / 2) / fh - 0.5 };
  let hint = null;
  if (m.size < CFG.MINFACE) hint = "Подойдите ближе";
  else if (m.size > Q.MAXFACE) hint = "Отодвиньтесь немного";
  else if (Math.abs(m.dx) > Q.CX || Math.abs(m.dy) > Q.CY) hint = "Лицо — в рамку";
  else if (m.light < Q.LIGHT_MIN) hint = "Мало света";
  else if (m.light > Q.LIGHT_MAX) hint = "Слишком яркий свет";
  else if (m.sharp < Q.SHARP_MIN) hint = "Не двигайтесь — кадр размыт";
  return { ok: !hint, hint, m };
}
let pxCv = null;
// Яркость и резкость (дисперсия лапласиана) по области лица, сжатой до 48×48
export function facePixels(frame, box) {
  pxCv ??= Object.assign(document.createElement("canvas"), { width: 48, height: 48 });
  const g = pxCv.getContext("2d", { willReadFrequently: true });
  const pad = 0.1, sx = Math.max(0, box.x - box.width * pad), sy = Math.max(0, box.y - box.height * pad);
  g.drawImage(frame, sx, sy, Math.min(frame.width - sx, box.width * (1 + 2 * pad)), Math.min(frame.height - sy, box.height * (1 + 2 * pad)), 0, 0, 48, 48);
  const d = g.getImageData(0, 0, 48, 48).data, Y = new Float32Array(48 * 48); let sum = 0;
  for (let i = 0; i < 2304; i++) { const y = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; Y[i] = y; sum += y; }
  let s = 0, s2 = 0, n = 0;
  for (let r = 1; r < 47; r++) for (let c = 1; c < 47; c++) {
    const k = r * 48 + c, l = Y[k - 1] + Y[k + 1] + Y[k - 48] + Y[k + 48] - 4 * Y[k]; s += l; s2 += l * l; n++;
  }
  return { light: sum / 2304, sharp: s2 / n - (s / n) ** 2 };
}

// ---------- сравнение с сохранёнными снимками ----------
const eu = (a, b) => { let s = 0; for (let i = 0; i < 128; i++) { const x = a[i] - b[i]; s += x * x; } return Math.sqrt(s); };
// emps: [{id, d:[[128]...]}]. По сотруднику — минимум по всем его снимкам; second — лучший ДРУГОЙ сотрудник.
export function match(emps, desc) {
  let id = null, d = 9, second = 9;
  for (const e of emps) {
    let m = 9; for (const s of (e.d || [])) { if (s?.length === 128) { const x = eu(desc, s); if (x < m) m = x; } }
    if (m < d) { second = d; d = m; id = e.id; } else if (m < second) second = m;
  }
  return { id, d, second };
}
export const isSame = (emps, id, desc, lim) => { const e = emps.find(x => x.id === id); return !!e?.d?.some(s => s?.length === 128 && eu(desc, s) < lim); };
// Решение по одному кадру: человек уверенно узнан (порог + отрыв от второго)
export const sure = m => m.id && m.d < CFG.MATCH && m.second - m.d >= CFG.GAP;

// ---------- проверка живости: одно короткое действие ----------
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const ear = (p, i) => (dist(p[i + 1], p[i + 5]) + dist(p[i + 2], p[i + 4])) / (2 * dist(p[i], p[i + 3]));
export const turnOffset = p => (p[30].x - (p[36].x + p[45].x) / 2) / dist(p[36], p[45]); // доли межглазного расстояния
export const EAR_LOW = 0.21, EAR_HIGH = 0.24, TURN_MIN = 0.2, TURN_BACK = 0.14;
// kind: "blink" | "left" | "right". Кадр с камеры не зеркальный: «влево» у человека = x носа растёт.
export class Live {
  constructor(kind) { this.kind = kind; this.closed = false; this.max = 0; this.centered = false; this.done = false; }
  get text() { return this.kind === "blink" ? "Моргните" : this.kind === "left" ? "Поверните голову влево" : "Поверните голову вправо"; }
  feed(p) {
    if (this.done) return true;
    if (this.kind === "blink") {
      const e = (ear(p, 36) + ear(p, 42)) / 2; this.max = Math.max(this.max, e);
      if (e < Math.max(EAR_LOW, 0.75 * this.max)) this.closed = true; else if (this.closed && e > EAR_HIGH) this.done = true;
    } else {
      const off = turnOffset(p) * (this.kind === "left" ? 1 : -1);
      if (!this.centered) { if (Math.abs(off) < TURN_BACK) this.centered = true; } else if (off > TURN_MIN) this.done = true;
    }
    return this.done;
  }
}
// Моргание на медленном телефоне (<6 кадров/с) можно пропустить — тогда только поворот
export function pickLive(avgCycleMs) {
  const kinds = avgCycleMs > 170 ? ["left", "right"] : ["blink", "blink", "left", "right"];
  return new Live(kinds[Math.floor(Math.random() * kinds.length)]);
}

// ---------- понятные причины ошибок (камера и загрузка моделей) ----------
export function explain(e) {
  const n = e?.name || "", m = String(e?.message || e || "");
  if (n === "NotAllowedError" || n === "SecurityError") return "Нет доступа к камере. Нажмите на значок замка (или камеры) в адресной строке, разрешите камеру и повторите. На iPhone: Настройки → Safari → Камера.";
  if (n === "NotFoundError" || n === "DevicesNotFoundError") return "Камера не найдена. Проверьте, что камера подключена и включена.";
  if (n === "NotReadableError" || n === "TrackStartError") return "Камера занята другой программой или вкладкой. Закройте их и повторите.";
  if (n === "OverconstrainedError") return "Эта камера не подходит по параметрам. Попробуйте другую камеру или другой браузер.";
  if (n === "QuotaExceededError" || /quota/i.test(m)) return "Не хватает места на устройстве для распознавания. Освободите память и повторите.";
  if (n === "TypeError" || navigator.onLine === false || /Failed to fetch|NetworkError|: \d{3}$/.test(m)) return "Нет интернета. При первом запуске нужно скачать распознавание (около 7 МБ), потом оно работает и без сети. Подключитесь и повторите.";
  return "Не удалось запустить распознавание: " + m;
}
