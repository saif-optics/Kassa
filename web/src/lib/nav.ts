// Разделы: порядок, названия, значки и цвета — один список для меню (App.tsx) и для карточек на Главной.
import { BarChart3, CalendarCheck, FileText, Glasses, Home, ListChecks, Package, Scale, ShoppingBag, Target, Users, Wallet, type LucideIcon } from "lucide-react";

export interface NavItem { id: string; label: string; icon: LucideIcon; color: string; ready?: boolean }
// color — цвет плитки значка (только палитра диаграмм)
export const NAV: NavItem[] = [
  { id: "home", label: "Главная", icon: Home, color: "var(--chart-1)", ready: true },
  { id: "kassa", label: "Касса", icon: Wallet, color: "var(--chart-1)", ready: true },
  { id: "sales", label: "Продажи", icon: ShoppingBag, color: "var(--chart-3)", ready: true },
  { id: "report", label: "Отчёт р/с", icon: FileText, color: "var(--chart-1)", ready: true },
  { id: "pay", label: "Платежи", icon: CalendarCheck, color: "var(--chart-4)", ready: true },
  { id: "tasks", label: "Задания", icon: ListChecks, color: "var(--chart-5)", ready: true },
  { id: "analytics", label: "Аналитика", icon: BarChart3, color: "var(--chart-2)", ready: true },
  { id: "plan", label: "План", icon: Target, color: "var(--chart-4)", ready: true },
  { id: "lens", label: "Линзы", icon: Glasses, color: "var(--chart-2)", ready: true },
  { id: "recon", label: "Сверка", icon: Scale, color: "var(--chart-5)", ready: true },
  { id: "batch", label: "Склад", icon: Package, color: "var(--chart-3)", ready: true },
  { id: "users", label: "Пользователи", icon: Users, color: "var(--chart-2)", ready: true },
];
