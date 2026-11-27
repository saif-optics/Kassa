// Экран загрузки «Фокус»: кольца логотипа из размытия в резкость, от центров колец расходятся две волны, затем надпись.
// Показывается один раз при открытии сайта: не короче 1,8 с, а если данные ещё грузятся — до готовности (не дольше 8 с).
// Фон всегда тёмный (экран бренда), в любой теме. Стили анимации — в index.css (.sp-*).
import { useEffect, useState } from "react";

const MIN_MS = 1800, MAX_MS = 8000, OUT_MS = 250;

/** ready — сайт готов (права и данные загружены или входа нет) */
export function Splash({ ready }: { ready: boolean }) {
  const [minDone, setMinDone] = useState(false), [capped, setCapped] = useState(false), [out, setOut] = useState(false), [gone, setGone] = useState(false);
  useEffect(() => { const a = setTimeout(() => setMinDone(true), MIN_MS), b = setTimeout(() => setCapped(true), MAX_MS); return () => { clearTimeout(a); clearTimeout(b); }; }, []);
  const go = minDone && (ready || capped);
  useEffect(() => { if (!go) return; setOut(true); const t = setTimeout(() => setGone(true), OUT_MS + 20); return () => clearTimeout(t); }, [go]);
  if (gone) return null;
  return (
    <div role="status" aria-label="Загрузка" className={"sp-root fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 overflow-hidden" + (out ? " sp-out" : "")}>
      <svg className="sp-logo" viewBox="495 640 942 340" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="sp-rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9be8ff" /><stop offset=".45" stopColor="#48bde0" /><stop offset="1" stopColor="#1c8fc0" /></linearGradient>
          <linearGradient id="sp-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e4a66" /><stop offset="1" stopColor="#162838" /></linearGradient>
          <linearGradient id="sp-hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <filter id="sp-gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <g className="sp-glow" filter="url(#sp-gl)"><circle cx="785" cy="810" r="118.5" fill="none" stroke="#48bde0" strokeWidth="60" /><circle cx="1145" cy="810" r="118.5" fill="none" stroke="#48bde0" strokeWidth="60" /></g>
        <path className="sp-side" d="M615 687 505 797 615 907Q565 797 615 687Z" fill="url(#sp-sg)" />
        <path className="sp-side" d="M1317 687 1427 797 1317 907Q1367 797 1317 687Z" fill="url(#sp-sg)" />
        <g fill="none">
          <g className="sp-ring"><circle cx="785" cy="810" r="118.5" stroke="url(#sp-rg)" strokeWidth="67" /><circle cx="785" cy="810" r="150" stroke="#fff" strokeOpacity=".55" strokeWidth="3" /><path d="M680 760A118.5 118.5 0 0 1 790 691.5" stroke="url(#sp-hg)" strokeWidth="20" strokeLinecap="round" /></g>
          <g className="sp-ring sp-ring2"><circle cx="1145" cy="810" r="118.5" stroke="url(#sp-rg)" strokeWidth="67" /><circle cx="1145" cy="810" r="150" stroke="#fff" strokeOpacity=".55" strokeWidth="3" /><path d="M1040 760A118.5 118.5 0 0 1 1150 691.5" stroke="url(#sp-hg)" strokeWidth="20" strokeLinecap="round" /></g>
        </g>
        <g fill="none" stroke="#9be8ff" strokeWidth="4">
          <circle className="sp-wave" cx="785" cy="810" r="120" /><circle className="sp-wave" cx="1145" cy="810" r="120" />
          <circle className="sp-wave sp-wave2" cx="785" cy="810" r="120" /><circle className="sp-wave sp-wave2" cx="1145" cy="810" r="120" />
        </g>
      </svg>
      <div className="sp-wm">SAIF-OPTICS</div>
      <div className="sp-sub">КАССА ОПТИКИ</div>
    </div>
  );
}
