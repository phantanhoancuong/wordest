/**
 * Computes the number of days since the Unix epoch in UTC.
 *
 * @returns The number of whole days since 01-01-1970 (UTC).
 */
export const getDateIndex = (): number => {
  const now = new Date();
  const utcToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const utcEpoch = Date.UTC(1970, 0, 1);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((utcToday - utcEpoch) / MS_PER_DAY);
};
