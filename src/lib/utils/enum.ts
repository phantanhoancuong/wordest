/**
 * Get enum values as a typed array.
 *
 * @param enumObject - The enum object to be converted.
 * @returns
 */
export const enumValues = <T extends Record<string, string | number>>(
  enumObject: T,
): Array<Extract<T[keyof T], string | number>> => {
  return Object.keys(enumObject)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => enumObject[key as keyof T]) as Array<
    Extract<T[keyof T], string | number>
  >;
};
