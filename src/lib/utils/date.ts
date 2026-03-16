import { MS_PER_DAY } from "@/lib/constants";

/**
 * Compute the number of days since the Unix epoch (01-01-1970) in UTC.
 *
 * Used as a stable numeric index for daily word generation.
 *
 * @returns The number of whole days elapsed since the Unix epoch in UTC.
 */
export const getDaysSinceEpoch = (): number => {
  const now = new Date();
  const utcToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const utcEpoch = Date.UTC(1970, 0, 1);
  return Math.floor((utcToday - utcEpoch) / MS_PER_DAY);
};

/**
 * Convert a day number to a formatted date string.
 *
 * @param daysSinceEpoch - The number of days since the Unix epoch, or null for today's date.
 * @param format - Output format: "database" for YYYY-MM-DD (default), "display" for "DD/MM/YYYY".
 * @returns A formatted date string.
 */

/**
 * Format a date as either database-friendly or user-friendly display string.
 *
 * @param options - Configuration object for data formatting.
 * @param options.daysSinceEpoch - The number of days since the Unix epoch (1970-01-01). If null or omitted, use today's date.
 * @param options.format - Output format: "database" for YYYY-MM-DD or "display" for DD/MM/YYYY. Default to database.
 * @returns A formatted date string in the specified format.
 */
export const getDateString = (options?: {
  daysSinceEpoch?: number | null;
  format?: "database" | "display";
}): string => {
  const { daysSinceEpoch = null, format = "database" } = options ?? {};

  const utcDate =
    daysSinceEpoch === null
      ? new Date()
      : new Date(daysSinceEpoch * MS_PER_DAY);

  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");

  if (format === "database") {
    return `${year}-${month}-${day}`;
  } else if (format === "display") {
    return `${day}/${month}/${year}`;
  }
};
