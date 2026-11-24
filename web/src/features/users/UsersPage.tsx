// Раздел «Пользователи» (только владелец и админ): кто и с какими правами заходит в кассу. Все действия — через функцию users-admin.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Chip, Tile, TileLabel, TileSub, TileValue, type ChipTone } from "@/components/Tile";
import { useIsPhone } from "@/lib/useMedia";
import { getSession } from "@/lib/source";
import { useData } from "@/lib/useData";
import { pl } from "@/features/pay/logic";
import { ROLES, MIN_PASS, byRoles, call, can, dt, genPass, groups, listUsers, recent, type Perms, type Role, type UserRow } from "./logic";
import { PassOnce, UserForm, emptyForm, formOf, type FormVals } from "./parts";

const TONE: Record<Role, ChipTone> = { owner: "info", admin: "info", cashier: "plus", seller: "muted", marketer: "warn" };
const KEY = ["kassa-users"];

// поля внутри строки не должны раскрывать карточку
const Stop = ({ children }: { children: React.ReactNode }) => (
  <span className="contents" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>{children}</span>
);

const bodyOf = (v: FormVals, limited?: boolean) => {
  const b: Record<string, unknown> = { label: v.label.trim() || null, phone: v.phone.trim() || null, position: v.position.trim() || null, note: v.note.trim() || null };
  if (!limited) { b.role = v.role; b.point = v.point || null; b.perms = v.perms as Perms; }
  return b;
};

export function UsersPage() {
  const phone = useIsPhone();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: listUsers, staleTime: 30_000 });
  const ses = useQuery({ queryKey: ["kassa-users-me"], queryFn: getSession, staleTime: Infinity });
  const { data: dd } = useData();
  const points = dd?.points || [];
  const rows = q.data || [];
  const email = String(ses.data?.user?.email || "");
  const meRow = rows.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const me = { email, role: (meRow?.role === "owner" ? "owner" : "admin") as Role };

  const [adding, setAdding] = useState(false), [busy, setBusy] = useState(false), [once, setOnce] = useState<{ email: string; pw: string } | null>(null);
  useEffect(() => { if (!once) return; const t = setTimeout(() => setOnce(null), 90_000); return () => clearTimeout(t); }, [once]);

  /** действие: вызов функции, при успехе — перечитать список; при ошибке — toast */
  const run = async (action: string, body: Record<string, unknown>, ok: string): Promise<boolean> => {
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
    if (await run("create", { email: mail, password: v.password, ...bodyOf(v) }, "Пользователь добавлен")) { setOnce({ email: mail, pw: v.password }); setAdding(false); }
  };

  let k = 0; const nx = () => Math.min(k++, 14); // сквозной номер посадки сверху вниз
  const showRecent = rows.some((u) => u.last_sign_in_at);
  const roleTxt = byRoles(rows);
  const on = rows.filter((u) => u.active !== false).length;

  const form = <UserForm key="new" mode="create" init={emptyForm(points)} points={points} me={me.role} busy={busy} submitLabel="Добавить" onSubmit={create} onCancel={() => setAdding(false)} />;
  const hint = <p className="text-[12.5px] leading-snug text-muted-foreground"><b className="text-foreground">Владелец</b> — всё и управление доступами. <b className="text-foreground">Админ</b> — всё, кроме владельца и других админов. <b className="text-foreground">Кассир, Продавец, Гость</b> — по переключателям; при выборе статуса ставится стартовый набор.</p>;

  const cols = (): RowColumn<UserRow>[] => [
    { key: "name", title: "Имя", main: true, cell: (u) => <span className={`flex min-w-0 flex-col ${u.active === false ? "opacity-55" : ""}`}><span className="truncate">{u.label || "—"}</span><span className="truncate text-[12px] font-normal text-muted-foreground">{u.email}</span></span> },
    { key: "role", title: "Статус", sub: true, cell: (u) => <Chip tone={TONE[u.role] || "muted"}>{ROLES[u.role] || u.role}</Chip> },
    { key: "phone", title: "Телефон", cell: (u) => u.phone || "—" },
    { key: "pos", title: "Должность", cell: (u) => u.position || "—" },
    { key: "act", title: "Включён", width: "80px", align: phone ? "right" : undefined, cell: (u) => {
      const c = can(u, me);
      return <Stop><Switch checked={u.active !== false} disabled={!c.ops || busy} onCheckedChange={(v) => { void run("update", { email: u.email, active: v }, v ? "Пользователь включён" : "Пользователь выключен"); }} aria-label="Включён" /></Stop>;
    } },
    { key: "last", title: "Последний вход", cell: (u) => <span className="whitespace-nowrap text-muted-foreground">{dt(u.last_sign_in_at)}</span> },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead title="Пользователи" sub="Кто и с какими правами заходит в кассу"
        actions={<Button size="lg" onClick={() => setAdding((a) => !a)}><Plus />Добавить пользователя</Button>} />

      {once && <PassOnce email={once.email} pw={once.pw} onClose={() => setOnce(null)} />}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile i={nx()} hero><TileLabel>Всего пользователей</TileLabel><TileValue count={rows.length} /><TileSub>{points.length ? `точек: ${points.length}` : " "}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Включено</TileLabel><TileValue count={on} /><TileSub>{rows.length - on > 0 ? `выключено: ${rows.length - on}` : "выключенных нет"}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>По ролям</TileLabel><TileValue>{rows.length}</TileValue><TileSub>{roleTxt || "—"}</TileSub></Tile>
        {showRecent && <Tile i={nx()}><TileLabel>Заходили за 7 дней</TileLabel><TileValue count={recent(rows)} /><TileSub>из {rows.length} {pl(rows.length, "пользователя", "пользователей", "пользователей")}</TileSub></Tile>}
      </div>

      {!phone && adding && <Card i={nx()} title="Добавить пользователя" note="пароль покажем один раз">{form}{hint}</Card>}
      {phone && (
        <Sheet open={adding} onOpenChange={setAdding}>
          <SheetContent side="bottom" className="glass max-h-[92dvh] gap-0 overflow-y-auto rounded-t-[24px] p-0">
            <SheetHeader className="border-b border-border p-4"><SheetTitle>Добавить пользователя</SheetTitle><SheetDescription>Пароль покажем один раз</SheetDescription></SheetHeader>
            <div className="flex flex-col gap-3 p-4">{form}{hint}</div>
          </SheetContent>
        </Sheet>
      )}

      {q.isLoading && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">Загрузка…</p>}
      {q.isError && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-minus">{q.error instanceof Error ? q.error.message : "Не удалось загрузить список"}</p>}
      {!q.isLoading && !q.isError && !rows.length && <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">Пока никого нет.</p>}
      {groups(rows, points).map((g) => (
        <Card key={g.key} i={nx()} title={g.title} note={`${g.rows.length} ${pl(g.rows.length, "пользователь", "пользователя", "пользователей")}`}>
          <RowCards columns={cols()} rows={g.rows} rowKey={(u) => u.email} dense
            expand={(u) => <UserEdit key={u.email + String(u.active)} u={u} me={me} points={points} busy={busy} run={run} onPass={(pw) => setOnce({ email: u.email, pw })} />} />
        </Card>
      ))}
    </div>
  );
}

type EditProps = { u: UserRow; me: { email: string; role: Role }; points: string[]; busy: boolean; run: (a: string, b: Record<string, unknown>, ok: string) => Promise<boolean>; onPass: (pw: string) => void };

// правка пользователя: форма и операции; удаление и смена пароля — с подтверждением внутри карточки
function UserEdit({ u, me, points, busy, run, onPass }: EditProps) {
  const c = can(u, me);
  const [ask, setAsk] = useState<"del" | "pw" | null>(null);
  const on = u.active !== false;
  if (!c.edit && !c.ops) return <p className="text-[13px] text-muted-foreground">Этого пользователя вы менять не можете.</p>;
  const save = (v: FormVals) => { void run("update", { email: u.email, ...bodyOf(v, c.limited) }, "Сохранено"); };
  const newPass = async () => { const pw = genPass(12); if (pw.length >= MIN_PASS && await run("password", { email: u.email, password: pw }, "Пароль изменён")) { onPass(pw); setAsk(null); } };
  const ops = c.ops && (ask ? (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-[13px] text-minus">{ask === "del" ? "Удалить пользователя насовсем?" : "Сменить пароль? Старый перестанет работать."}</span>
      <Button type="button" variant={ask === "del" ? "destructive" : "default"} disabled={busy} className="max-sm:w-full"
        onClick={() => { if (ask === "del") void run("delete", { email: u.email }, "Удалено"); else void newPass(); }}>{ask === "del" ? "Да, удалить" : "Да, сменить"}</Button>
      <Button type="button" variant="ghost" className="max-sm:w-full" onClick={() => setAsk(null)}>Отмена</Button>
    </div>
  ) : (
    <>
      <Button type="button" variant="secondary" size="lg" disabled={busy} className="max-sm:w-full" onClick={() => { void run("update", { email: u.email, active: !on }, on ? "Пользователь выключен" : "Пользователь включён"); }}><Power />{on ? "Выключить" : "Включить"}</Button>
      <Button type="button" variant="secondary" size="lg" disabled={busy} className="max-sm:w-full" onClick={() => setAsk("pw")}><KeyRound />Новый пароль</Button>
      <Button type="button" variant="ghost" size="lg" disabled={busy} className="text-minus max-sm:w-full" onClick={() => setAsk("del")}><Trash2 />Удалить</Button>
    </>
  ));
  return c.edit
    ? <UserForm mode="edit" init={formOf(u)} points={points} me={me.role} limited={c.limited} busy={busy} submitLabel="Сохранить" onSubmit={save} extra={ops} />
    : <div className="flex flex-col gap-2 sm:flex-row">{ops}</div>;
}
