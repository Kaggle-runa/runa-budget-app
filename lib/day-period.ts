export type DayPeriod = "day" | "night";

/** 6:00–17:59 は昼、18:00–5:59 は夜。端末のローカル時刻。 */
export function dayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();
  return hour >= 18 || hour < 6 ? "night" : "day";
}
