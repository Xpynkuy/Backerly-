export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
};

export const parsePositiveInt = (
  value: unknown,
  defaultValue: number,
  min: number = 1,
  max?: number,
): number => {
  const parsed = Number(value);

  if (isNaN(parsed) || parsed < min) {
    return defaultValue;
  }

  if (max !== undefined && parsed > max) {
    return max;
  }

  return Math.floor(parsed);
};
