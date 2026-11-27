// Данные «Отметок»: справочники, отметки за период, живое обновление (подписка на att_events + опрос раз в 30 с).
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client, isDemo } from "@/lib/source";
import { loadEvents, loadRefs, startOf, type AttEvent } from "./logic";

export const useAttRefs = () => useQuery({ queryKey: ["att-refs"], queryFn: loadRefs, staleTime: 30_000 });

/** отметки за дни from..to; пока открыт раздел — перечитываются раз в 30 с */
export const useAttEvents = (from: string, to: string, poll = true) =>
  useQuery({ queryKey: ["att-ev", from, to], queryFn: () => loadEvents(from, to), staleTime: 10_000, refetchInterval: poll ? 30_000 : false, placeholderData: (p) => p });

let seq = 0; // у каждой подписки своё имя канала (StrictMode подписывает дважды)
/** вживую: новая отметка → перечитать отметки. live — подписка действует; иначе работает только опрос */
export function useAttLive(): { live: boolean } {
  const qc = useQueryClient();
  const [live, setLive] = useState(isDemo);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (isDemo) return;
    const c = client();
    const ch = c.channel("kassa-att-live-" + ++seq).on("postgres_changes", { event: "*", schema: "public", table: "att_events" }, () => {
      clearTimeout(t.current);
      t.current = setTimeout(() => { void qc.invalidateQueries({ queryKey: ["att-ev"] }); }, 500);
    }).subscribe((st) => setLive(st === "SUBSCRIBED"));
    return () => { clearTimeout(t.current); void c.removeChannel(ch); };
  }, [qc]);
  return { live };
}

/** сегодняшние отметки и справочники одним набором (плитки «на работе» в Пользователях и журнал) */
export function useAttDay(day: string) {
  const refs = useAttRefs(), ev = useAttEvents(day, day);
  const points = refs.data?.points || [], emps = refs.data?.emps || [];
  return { refs, ev, points, emps, events: (ev.data || []) as AttEvent[], start: startOf(points) };
}
