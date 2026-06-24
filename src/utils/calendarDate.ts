/** Local calendar YYYY-MM-DD — do not use toISOString().slice(0, 10) for UI dates (UTC shifts).
 *  Appointment/slot API times are UTC ISO strings; new Date(iso) displays in the user's local timezone. */
export function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Stable day key for slot/calendar matching from an ISO-like string. */
export function calendarDayKey(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return toLocalYmd(d);
}

export function startOfWeekMondayYmd(focusYmd: string): string {
  const d = new Date(`${focusYmd}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toLocalYmd(d);
}

export function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toLocalYmd(d);
}

/** True if slot start instant (UTC ISO from API) is strictly before current time. */
export function isSlotStartInPast(iso: string): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return t < Date.now();
}

/** Lexical compare for YYYY-MM-DD. */
export function ymdIsBefore(a: string, b: string): boolean {
  return a < b;
}

/**
 * Same instant as {@link Date#toISOString}, but encodes the browser's local offset (RFC 3339).
 * Use for API payloads so DevTools show the user's wall time (e.g. 08:00+05:00) instead of UTC (03:00Z).
 * The server still receives one unambiguous instant; .NET parses offset ISO-8601 to UTC.
 */
export function toLocalOffsetIsoString(d: Date): string {
  if (Number.isNaN(d.getTime())) return new Date(0).toISOString();
  const pad = (n: number, len = 2) => String(Math.trunc(n)).padStart(len, '0');
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const oh = pad(Math.floor(abs / 60));
  const om = pad(abs % 60);
  return `${y}-${mo}-${day}T${h}:${min}:${s}.${ms}${sign}${oh}:${om}`;
}
