// Демо-пользователи для ?demo: вымышленные, список живёт в памяти и меняется действиями на странице.
import type { UserRow } from "./logic";

const base = Date.now();
const ago = (h: number) => new Date(base - h * 3600_000).toISOString();

export const demoRows = (): UserRow[] => [
  { email: "owner@example.invalid", role: "owner", point: null, label: "Хозяин", phone: "+998 90 000 00 01", position: "Владелец", note: null, perms: null, active: true, last_sign_in_at: ago(1) },
  { email: "admin@example.invalid", role: "admin", point: null, label: "Админ Тест", phone: null, position: "Управляющий", note: null, perms: null, active: true, last_sign_in_at: ago(30) },
  { email: "kassir1@example.invalid", role: "cashier", point: "Премиум", label: "Кассир Один", phone: "+998 90 000 00 11", position: "Кассир", note: "смены пн–ср", perms: null, active: true, last_sign_in_at: ago(5) },
  { email: "prod1@example.invalid", role: "seller", point: "Премиум", label: "Продавец Один", phone: null, position: "Продавец-консультант", note: null, perms: null, active: true, last_sign_in_at: ago(26) },
  { email: "prod2@example.invalid", role: "seller", point: "Яшнабад", label: "Продавец Два", phone: "+998 90 000 00 12", position: "Продавец", note: null, perms: null, active: true, last_sign_in_at: ago(24 * 12) },
  { email: "prod3@example.invalid", role: "seller", point: "Сергели", label: "Продавец Три", phone: null, position: null, note: "в отпуске", perms: null, active: false, last_sign_in_at: null },
  { email: "kassir2@example.invalid", role: "cashier", point: "Яшнабад", label: "Кассир Два", phone: null, position: "Кассир", note: null, perms: null, active: true, last_sign_in_at: ago(48) },
  { email: "guest@example.invalid", role: "marketer", point: "C1", label: "Гость Маркетинг", phone: null, position: "Маркетолог", note: null, perms: null, active: true, last_sign_in_at: ago(24 * 3) },
];
