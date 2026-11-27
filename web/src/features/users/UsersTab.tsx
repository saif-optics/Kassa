// Мини-раздел «Пользователи»: плитки, список по точкам, форма «Добавить пользователя» и «Статусы». Все действия — через функцию users-admin.
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { KeyRound, LogIn, Pencil, Plus, Power, ScanFace, Trash2, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/Card";
import { Fold } from "@/components/Fold";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { DUR, EASE, land } from "@/lib/motion";
import { getSession } from "@/lib/source";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { pl } from "@/features/pay/logic";
import { HintCtx, Piece } from "@/features/analytics/Puzzle";
import { useAttDay } from "@/features/att/hooks";
import { shifts, todayStr } from "@/features/att/logic";
import { Avatar, Dot, DotChip, IconBtn, usePointCol } from "./common";
import { MIN_PASS, ROLES, ROLE_DESC, ROLE_ORDER, ROLE_VAR, call, can, genPass, groups, initials, listUsers, seen, timeOf, type Perms, type Role, type UserRow } from "./logic";
import { PassOnce, UserForm, emptyForm, formOf, type FormVals } from "./parts";

const KEY = ["kassa-users"];
// колонки строки: до 1100 px — без должности и телефона
const COLS = "grid-cols-[minmax(0,1.6fr)_108px_150px_52px_164px] @min-[1100px]/main:grid-cols-[minmax(0,1.5fr)_112px_minmax(0,1fr)_140px_150px_52px_164px]";
const WIDE_ONLY = "hidden @min-[1100px]/main:block";

const bodyOf = (v: FormVals, limited?: boolean) => {
  const b: Record<string, unknown> = { label: v.label.trim() || null, phone: v.phone.trim() || null, position: v.position.trim() || null, note: v.note.trim() || null };
  if (!limited) { b.role = v.role; b.point = v.point || null; b.perms = v.perms as Perms; }
  return b;
};

type Run = (action: string, body: Record<string, unknown>, ok: string) => Promise<boolean>;
type Me = { email: string; role: Role };

export function UsersTab({ search, wide, addOpen, setAddOpen, points }: { search: string; wide: boolean; addOpen: boolean; setAddOpen: (v: boolean) => void; points: string[] }) {
  const phone = useIsPhone();
  const qc = useQueryClient();
  const col = usePointCol(points);
  const q = useQuery({ queryKey: KEY, queryFn: listUsers, staleTime: 30_000 });
  const ses = useQuery({ queryKey: ["kassa-users-me"], queryFn: getSession, staleTime: Infinity });
  const att = useAttDay(todayStr());
  const rows = useMemo(() => q.data || [], [q.data]);
  const email = String(ses.data?.user?.email || "");
  const meRow = rows.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const me: Me = { email, role: (meRow?.role === "owner" ? "owner" : "admin") as Role };

  const [busy, setBusy] = useState(false), [once, setOnce] = useState<{ email: string; pw: string } | null>(null);
  const [pt, setPt] = useState("all"), [edit, setEdit] = useState<UserRow | null>(null), [formKey, setFormKey] = useState(0);
  useEffect(() => { if (!once) return; const t = setTimeout(() => setOnce(null), 90_000); return () => clearTimeout(t); }, [once]);

  /** действие: вызов функции, при успехе — перечитать список; при ошибке — toast */
  const run: Run = async (action, body, ok) => {
    if (busy) return false;
    setBusy(true);
    const r = await call(action, body);
    setBusy(false);
    if (r.error) { toast.error(r.error); return false; }
    const warn = r.data && typeof r.data.warn === "string" ? r.data.warn : "";
    if (warn) toast.warning(warn); else toast.success(ok);
    await qc.invalidateQueries({ queryKey: KEY });
    return true;
  };
  const create = async (v: FormVals) => {
    const mail = v.email.trim();
    if (await run("create", { email: mail, password: v.password, ...bodyOf(v) }, "Пользователь добавлен")) { setOnce({ email: mail, pw: v.password }); setAddOpen(false); setFormKey((k) => k + 1); }
  };

  // плитки
  const on = rows.filter((u) => u.active !== false).length, off = rows.length - on;
  const nPts = new Set(rows.map((u) => u.point).filter(Boolean)).size;
  const today = rows.filter((u) => seen(u.last_sign_in_at).today);
  const lastIn = [...today].sort((a, b) => +new Date(b.last_sign_in_at || 0) - +new Date(a.last_sign_in_at || 0))[0];
  const act = att.emps.filter((e) => e.active);
  const here = useMemo(() => new Set(shifts(att.events, att.start).filter((s) => s.in && s.last.kind === "in").map((s) => s.emp)), [att.events, att.start]);
  const onWork = act.filter((e) => here.has(e.id)).length;
  const attOk = !!att.refs.data && !att.ev.isError;

  // список: точка и поиск
  const s = search.trim().toLowerCase();
  const shown = rows.filter((u) => (pt === "all" || u.point === pt) && (!s || [u.label, u.email, u.phone, u.position].some((x) => String(x || "").toLowerCase().includes(s))));
  const ptItems = [{ key: "all", label: "Все" }, ...[...points, ...rows.map((u) => u.point || "")].filter((p, i, a) => p && a.indexOf(p) === i).map((p) => ({ key: p, label: p }))];

  let k = 0; const nx = () => Math.min(k++, 8);
  const form = <UserForm key={formKey} mode="create" init={emptyForm(points)} points={points} me={me.role} busy={busy} submitLabel="Добавить" onSubmit={create} onCancel={wide ? undefined : () => setAddOpen(false)} />;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3.5 @min-[900px]/main:grid-cols-4">
        <Tile i={nx()} hero icon={Users}>
          <TileLabel>Пользователей</TileLabel>
          <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
            <TileValue count={rows.length} />
            <TileSub className="mt-1 @min-[640px]/main:mt-0"><span>{nPts ? <>в {nPts} {pl(nPts, "точке", "точках", "точках")}<span className="max-[639px]:hidden"> + владелец</span></> : " "}</span></TileSub>
          </div>
        </Tile>
        <Tile i={nx()} icon={UserCheck} tone="plus" glow="plus">
          <TileLabel>Включены</TileLabel>
          <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
            <TileValue count={on} />
            <TileSub className="mt-1 @min-[640px]/main:mt-0">{off > 0 ? <Chip tone="warn">{off} {pl(off, "выключен", "выключены", "выключено")}</Chip> : <span>выключенных нет</span>}</TileSub>
          </div>
        </Tile>
        <Tile i={nx()} icon={ScanFace} tone="brand" glow="brand">
          <TileLabel>Сейчас на работе</TileLabel>
          <div className="flex flex-col pb-1.5 @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
            <span className="flex items-baseline gap-2"><TileValue count={attOk ? onWork : 0}>{attOk ? undefined : "—"}</TileValue>{attOk && <span className="num text-[15px] font-bold text-muted-foreground @min-[640px]/main:text-lg">из {act.length}</span>}</span>
            <TileSub className="mt-1 @min-[640px]/main:mt-0 max-[639px]:hidden"><span>по отметкам</span></TileSub>
          </div>
          {attOk && act.length > 0 && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-muted"><motion.i className="block h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (onWork / act.length) * 100)}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} /></span>}
        </Tile>
        <Tile i={nx()} icon={LogIn} tone="info" glow="info">
          <TileLabel>Входили сегодня</TileLabel>
          <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
            <TileValue count={today.length} />
            <TileSub className="mt-1 @min-[640px]/main:mt-0"><span>{lastIn ? <><span className="max-[639px]:hidden">последний {timeOf(lastIn.last_sign_in_at as string)} · {lastIn.label || lastIn.email.split("@")[0]}</span><span className="@min-[640px]/main:hidden">последний {timeOf(lastIn.last_sign_in_at as string)}</span></> : "сегодня никто"}</span></TileSub>
          </div>
        </Tile>
      </div>

      {phone && <Button size="lg" className="h-12 w-full text-[15px]" onClick={() => setAddOpen(true)}><Plus />Добавить пользователя</Button>}

      <AnimatePresence initial={false}>
        {once && <motion.div key="once" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden"><PassOnce email={once.email} pw={once.pw} onClose={() => setOnce(null)} /></motion.div>}
      </AnimatePresence>

      <div className={cn("grid items-start gap-3.5", wide && "grid-cols-[minmax(0,1fr)_540px]")}>
        {phone ? (
          <div className="flex flex-col gap-3.5">
            {q.isLoading && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">Загрузка…</p>}
            {q.isError && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-minus">{q.error instanceof Error ? q.error.message : "Не удалось загрузить список"}</p>}
            {!q.isLoading && !q.isError && <Segments items={ptItems} value={pt} onChange={setPt} aria-label="Точка" />}
            {!q.isLoading && !q.isError && !shown.length && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">{rows.length ? "Никого не нашли." : "Пока никого нет."}</p>}
            {groups(shown, points).map((g) => (
              <section key={g.key} className="flex flex-col gap-2">
                <GroupHead title={g.title} n={g.rows.length} color={col(g.key || null)} />
                <Fold id={`users.${g.key || "all"}`} rows={g.rows} className="flex flex-col gap-2">{(sh) => <div className="flex flex-col gap-2">{sh.map((u, i) => <UserLine key={u.email} u={u} i={i} phone me={me} busy={busy} run={run} onEdit={setEdit} onPass={(pw) => setOnce({ email: u.email, pw })} />)}</div>}</Fold>
              </section>
            ))}
          </div>
        ) : (
          <Card i={nx()} title="Пользователи по точкам" action={<Segments items={ptItems} value={pt} onChange={setPt} size="sm" aria-label="Точка" />}>
            {q.isLoading && <p className="px-1 py-6 text-[13.5px] text-muted-foreground">Загрузка…</p>}
            {q.isError && <p className="px-1 py-6 text-[13.5px] text-minus">{q.error instanceof Error ? q.error.message : "Не удалось загрузить список"}</p>}
            {!q.isLoading && !q.isError && !shown.length && <p className="px-1 py-8 text-center text-[13.5px] text-muted-foreground">{rows.length ? "Никого не нашли." : "Пока никого нет."}</p>}
            {shown.length > 0 && (
              <div role="table" aria-label="Пользователи" className="min-w-0">
                <div role="row" className={cn("grid items-center gap-x-3 px-2 pb-2 text-[11.5px] font-semibold tracking-[.06em] text-muted-foreground uppercase", COLS)}>
                  <span role="columnheader" className="pl-[52px]">Пользователь</span><span role="columnheader">Статус</span><span role="columnheader" className={WIDE_ONLY}>Должность</span><span role="columnheader" className={WIDE_ONLY}>Телефон</span>
                  <span role="columnheader">Последний вход</span><span role="columnheader">Вкл.</span><span role="columnheader" className="text-right">Действия</span>
                </div>
                {groups(shown, points).map((g) => (
                  <div key={g.key} role="rowgroup">
                    <GroupHead title={g.title} n={g.rows.length} color={col(g.key || null)} className="px-2 pt-3 pb-1.5" />
                    <Fold id={`users.${g.key || "all"}`} rows={g.rows}>{(sh) => <div>{sh.map((u, i) => <UserLine key={u.email} u={u} i={i} me={me} busy={busy} run={run} onEdit={setEdit} onPass={(pw) => setOnce({ email: u.email, pw })} />)}</div>}</Fold>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {wide && (
          <HintCtx.Provider value={false}>
            <div className="pzc">
              <Piece d={[0, 0, 1, 1]} bridge={{ dir: "v", d: "74%" }}>
                <div className="flex items-center gap-2.5 pb-1"><span className="grid size-8 place-items-center rounded-[10px] bg-primary/15 text-primary"><Plus className="size-[18px]" /></span><h2 className="text-lg font-bold">Добавить пользователя</h2></div>
                {form}
              </Piece>
              <Statuses />
            </div>
          </HintCtx.Provider>
        )}
      </div>

      {/* форма добавления листом: на телефоне и там, где справа нет места */}
      {!wide && (
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
            <SheetHeader className="border-b border-border p-4"><SheetTitle>Добавить пользователя</SheetTitle><SheetDescription>Пароль покажем один раз</SheetDescription></SheetHeader>
            <div className="flex flex-col gap-3 p-4">{form}<Statuses plain /></div>
          </SheetContent>
        </Sheet>
      )}
      <Sheet open={!!edit} onOpenChange={(o) => { if (!o) setEdit(null); }}>
        <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
          <SheetHeader className="border-b border-border p-4"><SheetTitle>{edit?.label || edit?.email || "Пользователь"}</SheetTitle><SheetDescription>{edit?.email}</SheetDescription></SheetHeader>
          {edit && <EditForm key={edit.email} u={edit} me={me} points={points} busy={busy} run={run} onDone={() => setEdit(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function GroupHead({ title, n, color, className }: { title: string; n: number; color: string; className?: string }) {
  return <div className={cn("flex items-center gap-2 text-[14px] font-bold", className)}><Dot color={color} className="size-2.5" />{title}<span className="num text-[13px] font-semibold text-muted-foreground">· {n}</span></div>;
}

/** блок «Статусы»: пять ролей с цветом и коротким описанием */
function Statuses({ plain }: { plain?: boolean }) {
  const body = (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-[13.5px] leading-snug min-[420px]:grid-cols-2">
      {ROLE_ORDER.map((r) => <li key={r} className="flex gap-2"><Dot color={ROLE_VAR[r]} className="mt-[7px]" /><span><b>{ROLES[r]}</b> — {ROLE_DESC[r]}</span></li>)}
    </ul>
  );
  if (plain) return <div className="glass-inner flex flex-col gap-2.5 rounded-2xl p-3.5"><h3 className="text-[15px] font-bold">Статусы</h3>{body}</div>;
  return <Piece d={[0, 0, 1, 1]}><h2 className="pb-1 text-lg font-bold">Статусы</h2>{body}</Piece>;
}

/** правка пользователя в листе: форма «Сохранить» */
function EditForm({ u, me, points, busy, run, onDone }: { u: UserRow; me: Me; points: string[]; busy: boolean; run: Run; onDone: () => void }) {
  const c = can(u, me);
  if (!c.edit) return <p className="p-4 text-[13px] text-muted-foreground">Этого пользователя вы менять не можете.</p>;
  const save = async (v: FormVals) => { if (await run("update", { email: u.email, ...bodyOf(v, c.limited) }, "Сохранено")) onDone(); };
  return <div className="p-4"><UserForm mode="edit" init={formOf(u)} points={points} me={me.role} limited={c.limited} busy={busy} submitLabel="Сохранить" onSubmit={save} onCancel={onDone} /></div>;
}

type LineProps = { u: UserRow; i: number; phone?: boolean; me: Me; busy: boolean; run: Run; onEdit: (u: UserRow) => void; onPass: (pw: string) => void };

/** строка пользователя (таблица или карточка); удаление и новый пароль — с подтверждением под строкой */
function UserLine({ u, i, phone, me, busy, run, onEdit, onPass }: LineProps) {
  const c = can(u, me), on = u.active !== false, sn = seen(u.last_sign_in_at);
  const [ask, setAsk] = useState<"del" | "pw" | null>(null);
  const rc = ROLE_VAR[u.role] || "var(--chart-5)";
  const name = u.label || u.email.split("@")[0];
  const toggle = (v: boolean) => { void run("update", { email: u.email, active: v }, v ? "Пользователь включён" : "Пользователь выключен"); };
  const newPass = async () => { const pw = genPass(12); if (pw.length >= MIN_PASS && await run("password", { email: u.email, password: pw }, "Пароль изменён")) { onPass(pw); setAsk(null); } };
  const sw = <Switch checked={on} disabled={!c.ops || busy} onCheckedChange={toggle} aria-label={`Включён: ${name}`} />;
  const btns = (
    <div className={cn("flex items-center gap-1.5", phone ? "grid grid-cols-4" : "justify-end")}>
      {c.edit && <IconBtn icon={Pencil} label="Изменить" onClick={() => onEdit(u)} className={phone ? "!w-full" : ""} />}
      {c.ops && <>
        <IconBtn icon={KeyRound} label="Новый пароль" color="var(--warn)" disabled={busy} onClick={() => setAsk("pw")} className={phone ? "!w-full" : ""} />
        <IconBtn icon={Power} label={on ? "Выключить" : "Включить"} disabled={busy} onClick={() => toggle(!on)} className={phone ? "!w-full" : ""} />
        <IconBtn icon={Trash2} label="Удалить" color="var(--minus)" disabled={busy} onClick={() => setAsk("del")} className={phone ? "!w-full" : ""} />
      </>}
    </div>
  );
  const confirm = (
    <AnimatePresence initial={false}>
      {ask && (
        <motion.div key="ask" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
          <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center">
            <span className="text-[13px] font-medium text-minus sm:flex-1">{ask === "del" ? `Удалить «${name}» насовсем?` : "Сменить пароль? Старый перестанет работать."}</span>
            <Button type="button" size="sm" variant={ask === "del" ? "destructive" : "default"} disabled={busy} className="max-sm:w-full" onClick={() => { if (ask === "del") void run("delete", { email: u.email }, "Удалено"); else void newPass(); }}>{ask === "del" ? "Да, удалить" : "Да, сменить"}</Button>
            <Button type="button" size="sm" variant="ghost" className="max-sm:w-full" onClick={() => setAsk(null)}>Отмена</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const role = <DotChip color={rc} className="w-fit">{ROLES[u.role] || u.role}</DotChip>;
  const lastTxt = <span className={cn("flex items-center gap-1.5 whitespace-nowrap", sn.online ? "text-foreground" : "text-muted-foreground")} title={sn.online ? "в сети" : undefined}><Dot color={sn.online ? "var(--plus)" : "var(--chart-5)"} className={cn("size-[7px]", sn.online && "shadow-[0_0_0_3px_color-mix(in_srgb,var(--plus)_25%,transparent)]")} />{sn.text}</span>;

  if (phone) {
    return (
      <motion.div {...land(Math.min(i, 5))} className="glass-inner flex flex-col gap-3 rounded-[20px] p-3.5">
        <div className={cn("flex items-center gap-3", !on && "opacity-55")}>
          <Avatar text={initials(u.label || u.email)} color={rc} size={46} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15.5px] font-bold">{name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">{role}<span className="text-[12.5px]">{lastTxt}</span></div>
            <div className="mt-1 truncate text-[12px] text-muted-foreground">{[u.email, u.position].filter(Boolean).join(" · ")}</div>
          </div>
          {sw}
        </div>
        <div className={cn(!on && "opacity-80")}>{btns}</div>
        {confirm}
      </motion.div>
    );
  }
  return (
    <motion.div {...land(Math.min(i, 5))} className="border-t border-border/60">
      <div className={cn("grid items-center gap-x-3 px-2 py-2.5 text-[13.5px]", COLS)}>
        <div className={cn("flex min-w-0 items-center gap-3", !on && "opacity-55")}>
          <Avatar text={initials(u.label || u.email)} color={rc} />
          <div className="min-w-0"><div className="truncate font-bold">{name}</div><div className="truncate text-[12px] text-muted-foreground">{u.email}</div></div>
        </div>
        <div className={cn(!on && "opacity-55")}>{role}</div>
        <div className={cn(WIDE_ONLY, "min-w-0 truncate", !on && "opacity-55")}>{u.position || <span className="text-muted-foreground">—</span>}</div>
        <div className={cn(WIDE_ONLY, "num whitespace-nowrap", !on && "opacity-55")}>{u.phone || <span className="text-muted-foreground">—</span>}</div>
        <div className={cn("num", !on && "opacity-55")}>{lastTxt}</div>
        <div>{sw}</div>
        {btns}
      </div>
      <div className="px-2">{confirm}</div>
    </motion.div>
  );
}
