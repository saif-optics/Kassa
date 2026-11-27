// Раздел «Пользователи» (только владелец и админ): два мини-раздела — «Пользователи» (доступы в кассу) и «Отметки» (приход сотрудников по лицу).
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, RefreshCw, ScanFace, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { fade } from "@/lib/motion";
import { hashOf, useHashParams } from "@/lib/go";
import { useData } from "@/lib/useData";
import { useIsPhone, useMedia } from "@/lib/useMedia";
import { AttActions, AttTab } from "@/features/att/AttTab";
import { useAttLive } from "@/features/att/hooks";
import { useAttNav } from "@/features/att/nav";
import { UsersTab } from "./UsersTab";

type Sub = "users" | "att";
const LS = "kassa-web.users.sub";
const readLS = (): Sub => { try { return localStorage.getItem(LS) === "att" ? "att" : "users"; } catch { return "users"; } };
const readHash = (): Sub | null => { const p = new URLSearchParams(location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?") + 1) : "").get("sub"); return p === "att" || p === "users" ? p : null; };

export function UsersPage() {
  const phone = useIsPhone(), wide = useMedia("(min-width: 1760px)");
  const qc = useQueryClient();
  const { data: dd } = useData();
  const params = useHashParams();
  const [sub, setSub] = useState<Sub>(() => readHash() ?? readLS());
  const [search, setSearch] = useState(""), [addOpen, setAddOpen] = useState(false), [spin, setSpin] = useState(false);
  const nav = useAttNav();
  const { live } = useAttLive();

  // ссылка с ?sub=… (например с Главной) переключает мини-раздел
  const ps = params.get("sub");
  useEffect(() => { if (ps === "att" || ps === "users") setSub(ps); }, [ps]);
  const pick = (k: string) => {
    const s = k as Sub; setSub(s);
    try { localStorage.setItem(LS, s); } catch { /* нет хранилища */ }
    history.replaceState(null, "", `${location.pathname}${location.search}#${hashOf("users", s === "att" ? { sub: "att" } : undefined)}`);
  };
  const refresh = async () => {
    setSpin(true);
    await Promise.all([qc.invalidateQueries({ queryKey: ["kassa-users"] }), qc.invalidateQueries({ queryKey: ["att-ev"] }), qc.invalidateQueries({ queryKey: ["att-refs"] })]);
    setTimeout(() => setSpin(false), 400);
  };

  const mid = (
    <Segments value={sub} onChange={pick} aria-label="Раздел" items={[
      { key: "users", label: <><Users className="size-4" />Пользователи</> },
      { key: "att", label: <><ScanFace className="size-4" />Отметки</> },
    ]} />
  );
  const actions = sub === "users" ? (
    <>
      <label className="relative flex h-10 items-center sm:w-[260px] max-sm:!flex-[4]">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени, почте" aria-label="Поиск по имени, почте" autoComplete="off" className="h-10 w-full rounded-full bg-muted/60 pl-10" />
      </label>
      <Button type="button" variant="ghost" onClick={() => void refresh()} aria-label="Обновить" className="h-10 rounded-full bg-muted/60 px-4 max-sm:!flex-none max-sm:px-0 max-sm:w-10"><RefreshCw className={spin ? "animate-spin" : ""} /><span className="max-sm:hidden">Обновить</span></Button>
      {!wide && !phone && <Button type="button" className="h-10 rounded-full px-5" onClick={() => setAddOpen(true)}><Plus />Добавить пользователя</Button>}
    </>
  ) : <AttActions nav={nav} />;

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead title="Пользователи" sub={sub === "users" ? "доступы и отметки сотрудников" : "приход сотрудников по лицу"} mid={mid} actions={actions} />
      <motion.div key={sub} {...fade}>
        {sub === "users" ? <UsersTab search={search} wide={wide} addOpen={addOpen} setAddOpen={setAddOpen} points={dd?.points || []} /> : <AttTab nav={nav} live={live} wide={wide} />}
      </motion.div>
    </div>
  );
}
