export const parseUtcInstant = (value) => {
  if (!value) return null;
  const numericValue = typeof value === 'number' ? value : Number.NaN;
  if (Number.isFinite(numericValue)) {
    const date = new Date(numericValue < 1e12 ? numericValue * 1000 : numericValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const timestamp = String(value);
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp) ? timestamp : `${timestamp}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};
