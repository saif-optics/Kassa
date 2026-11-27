// Окно регистрации лица: 5 снимков с разных ракурсов, с проверкой качества кадра и «тот же человек».
// Распознавание — модуль smena/face.js (face-api, локальные веса): подключается только при открытии окна, в сборку web не входит.
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DUR, EASE } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Kit = Record<string, any>;

let kitP: Promise<Kit> | null = null;
/** модуль лежит рядом с web: сайт/smena/face.js (в dev его отдаёт vite по /smena/) */
function loadKit(): Promise<Kit> {
  return (kitP ??= (async () => {
    for (const rel of ["../smena/", "./smena/"]) {
      const url = new URL(rel + "face.js", document.baseURI).href;
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (r.ok && /javascript/i.test(r.headers.get("content-type") || "")) return (await import(/* @vite-ignore */ url)) as Kit;
      } catch { /* пробуем следующий путь */ }
    }
    throw new Error("Не найден модуль распознавания лица (папка smena рядом с сайтом)");
  })().catch((e) => { kitP = null; throw e; }));
}

// ракурсы: подсказка и проверка поворота головы (turnOffset: доли межглазного расстояния)
const POSES: { t: string; ok: (o: number) => boolean }[] = [
  { t: "Смотрите прямо в камеру", ok: (o) => Math.abs(o) < 0.12 },
  { t: "Чуть поверните голову влево", ok: (o) => o > 0.12 },
  { t: "Чуть поверните голову вправо", ok: (o) => o < -0.12 },
  { t: "Подбородок чуть выше", ok: (o) => Math.abs(o) < 0.2 },
  { t: "Подбородок чуть ниже", ok: (o) => Math.abs(o) < 0.2 },
];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Props = { open: boolean; name: string; onClose: () => void; onDone: (descriptors: number[][]) => void };

export function FaceCapture({ open, name, onClose, onDone }: Props) {
  const phone = useIsPhone();
  const video = useRef<HTMLVideoElement>(null);
  const [hint, setHint] = useState("Подготовка…"), [n, setN] = useState(0), [err, setErr] = useState("");
  const done = useRef(onDone); done.current = onDone;

  useEffect(() => {
    if (!open) return;
    let stop = false, stream: MediaStream | null = null;
    setN(0); setErr(""); setHint("Загрузка распознавания… 0%");
    (async () => {
      try {
        const F = await loadKit();
        const fa = await F.loadFace((p: number) => { if (!stop) setHint("Загрузка распознавания… " + Math.round(p * 100) + "%"); });
        if (stop) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } });
        for (let i = 0; i < 40 && !video.current && !stop; i++) await sleep(50);
        const v = video.current;
        if (!v || stop) return;
        v.srcObject = stream; await v.play();
        setHint("Разогрев…"); await F.warmup(fa);
        const fc = document.createElement("canvas"), fg = fc.getContext("2d")!;
        const out: number[][] = []; let first: number[] | null = null, lastAt = 0;
        while (out.length < POSES.length && !stop) {
          const pose = POSES[out.length];
          await new Promise((r) => requestAnimationFrame(r)); await sleep(60);
          if (!v.videoWidth) continue;
          if (fc.width !== v.videoWidth) { fc.width = v.videoWidth; fc.height = v.videoHeight; }
          fg.drawImage(v, 0, 0);
          const det = await F.detect(fa, fc);
          if (stop) break;
          if (!det) { setHint("Лицо не видно — подойдите ближе, нужен хороший свет"); continue; }
          const q = F.quality(det.box, fc.width, fc.height, F.facePixels(fc, det.box));
          if (!q.ok) { setHint(q.hint); continue; }
          const lm = await F.landmarks(fa, fc, det); if (!lm) continue;
          if (!pose.ok(F.turnOffset(lm.landmarks.positions))) { setHint(pose.t); continue; }
          if (Date.now() - lastAt < 700) { setHint(pose.t); continue; } // пауза между снимками, чтобы успеть сменить ракурс
          const d = Array.from(await F.describeFace(fa, fc, lm) as ArrayLike<number>, (x) => +x.toFixed(5));
          if (first && F.match([{ id: 1, d: [first] }], d).d > 0.6) { setHint("В кадре должен быть один человек"); continue; }
          first ||= d; out.push(d); lastAt = Date.now(); setN(out.length);
          setHint(out.length < POSES.length ? "Есть! " + POSES[out.length].t : "Готово");
        }
        if (!stop && out.length === POSES.length) { await sleep(500); if (!stop) done.current(out); }
      } catch (e) {
        if (!stop) setErr(e instanceof Error && e.name === "NotAllowedError" ? "Нет доступа к камере — разрешите её в настройках браузера" : e instanceof Error && e.name === "NotFoundError" ? "Камера не найдена" : e instanceof Error ? e.message : "Не удалось включить камеру");
      }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); if (video.current) video.current.srcObject = null; };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[94dvh] rounded-t-[24px]" : "sm:max-w-md")}>
        <SheetHeader className="border-b border-border p-4 pr-12"><SheetTitle>{name}</SheetTitle><SheetDescription>Снимок лица · {Math.min(n + 1, POSES.length)} из {POSES.length}</SheetDescription></SheetHeader>
        <div className="flex flex-col gap-3.5 p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
            <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-[12%] rounded-[50%] border-2 border-dashed border-white/60" />
            {!err && n === 0 && <div className="absolute inset-0 grid place-items-center bg-black/35"><ScanFace className="size-10 animate-pulse text-white/80" /></div>}
          </div>
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            {POSES.map((_, i) => <span key={i} className={cn("grid size-7 place-items-center rounded-full border text-[12px] font-bold transition-colors", i < n ? "border-plus bg-plus text-white" : i === n ? "border-primary text-primary" : "border-border text-muted-foreground")}>{i < n ? <Check className="size-4" /> : i + 1}</span>)}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.i className="block h-full rounded-full bg-primary" animate={{ width: `${(n / POSES.length) * 100}%` }} transition={{ duration: DUR.base, ease: EASE.out }} /></div>
          <p role="status" className={cn("min-h-[2.6em] text-center text-[14.5px] font-semibold", err ? "text-minus" : "")}>{err || hint}</p>
          <p className="text-center text-[12px] leading-snug text-muted-foreground">Снимите очки и маску, лицо должно быть освещено. Снимаем на этом устройстве — лучше на компьютере точки.</p>
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
