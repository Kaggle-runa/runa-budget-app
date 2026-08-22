import { format, getDay } from "date-fns";
import { ja } from "date-fns/locale";

export function formatYen(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}

export function formatSignedYen(amount: number): string {
  if (amount > 0) return `+${amount.toLocaleString("ja-JP")}円`;
  if (amount < 0) return `-${Math.abs(amount).toLocaleString("ja-JP")}円`;
  return "0円";
}

export function formatAxisYen(value: number): string {
  return value.toLocaleString("ja-JP");
}

export function formatCompactYen(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("ja-JP");
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return "0";
}

export function formatAsOf(date: Date): string {
  return `${format(date, "yyyy-MM-dd")}時点`;
}

export function formatMonthTitle(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function formatDayHeading(date: Date): string {
  return format(date, "M月d日(E)", { locale: ja });
}

export function formatDateDot(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
}

export function weekdayTone(date: Date): "sun" | "sat" | "weekday" {
  const day = getDay(date);
  if (day === 0) return "sun";
  if (day === 6) return "sat";
  return "weekday";
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function toDateTimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
