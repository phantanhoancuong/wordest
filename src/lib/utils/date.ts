import { MS_PER_DAY } from "@/lib/constants";

/**
 * Computes the number of days since the Unix epoch in UTC.
 *
 * @returns The number of whole days since 01-01-1970 (UTC).
 */
export const getTodayDateIndex = (): number => {
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
 * Converts the date
 * @param dateIndex
 * @returns
 */
export const dateIndexToDateString = (dateIndex: number | null): string => {
  if (dateIndex === null) return "N/A";
  const utcDate = new Date(dateIndex * MS_PER_DAY);
  const stringDate =
    utcDate.getDate().toString() +
    "/" +
    utcDate.getMonth().toString() +
    "/" +
    utcDate.getFullYear().toString();
  return stringDate;
};
