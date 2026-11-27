// Демо-пользователи для ?demo: вымышленные, список живёт в памяти и меняется действиями на странице.
import type { UserRow } from "./logic";

const base = Date.now();
const ago = (h: number) => new Date(base - h * 3600_000).toISOString();

export const demoRows = (): UserRow[] => [
  { email: "owner@example.invalid", role: "owner", point: null, label: "Азиз Каримов", phone: "+998 90 000 00 01", position: null, note: null, perms: null, active: true, last_sign_in_at: ago(0.2) },
  { email: "admin@example.invalid", role: "admin", point: null, label: "Анвар Хасанов", phone: null, position: "Управляющий", note: null, perms: null, active: true, last_sign_in_at: ago(30) },
  { email: "madina@example.invalid", role: "cashier", point: "Премиум", label: "Мадина Саидова", phone: "+998 90 000 00 02", position: "Кассир", note: "смены пн–ср", perms: null, active: true, last_sign_in_at: ago(0.4) },
  { email: "farrukh@example.invalid", role: "seller", point: "Премиум", label: "Фаррух Тошев", phone: "+998 90 000 00 03", position: "Мастер", note: null, perms: null, active: true, last_sign_in_at: ago(26) },
  { email: "lola@example.invalid", role: "cashier", point: "Яшнабад", label: "Лола Алиева", phone: "+998 90 000 00 04", position: "Кассир", note: null, perms: null, active: true, last_sign_in_at: ago(2) },
  { email: "kamila@example.invalid", role: "seller", point: "Яшнабад", label: "Камила Назарова", phone: "+998 90 000 00 05", position: "Продавец", note: null, perms: null, active: true, last_sign_in_at: ago(24 * 3) },
  { email: "behzod@example.invalid", role: "seller", point: "Сергели", label: "Бехзод Мирзаев", phone: "+998 90 000 00 06", position: "Продавец", note: null, perms: null, active: true, last_sign_in_at: ago(24 * 2) },
  { email: "dilnoza@example.invalid", role: "marketer", point: "C1", label: "Дилноза Юсупова", phone: null, position: "Маркетолог", note: "в отпуске", perms: null, active: false, last_sign_in_at: ago(24 * 11) },
];
