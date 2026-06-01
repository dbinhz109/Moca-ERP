import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string | undefined | null, fallback = "?"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Parses a date string tolerant of multiple backend formats:
 *  - ISO 8601 ("2026-05-19T04:33:03.163505Z")
 *  - PostgreSQL ("2026-05-19 04:33:03.163505+00")
 *  - Date-only ("2026-05-19")
 */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  // Try as-is first
  let d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  // Normalize Postgres-ish "YYYY-MM-DD HH:MM:SS[.fff][+TZ]" -> ISO
  const normalized = value
    .replace(" ", "T")
    .replace(/(\+\d{2})$/, "$1:00") // +00 -> +00:00
    .replace(/(\+\d{2})(\d{2})$/, "$1:$2");
  d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value?: string | null, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = parseDate(value);
  if (!d) return value || "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateTime(value?: string | null): string {
  const d = parseDate(value);
  if (!d) return value || "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(value?: string | null): string {
  const d = parseDate(value);
  if (!d) return value || "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatVnd(value?: number | null): string {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}
