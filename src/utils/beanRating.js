export function normalizeBeanRating(value) {
  if (typeof value === 'boolean') return 0;
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 0 && rating <= 5 ? rating : 0;
}

export function normalizeBean(bean) {
  return {
    ...bean,
    rating: normalizeBeanRating(bean?.rating)
  };
}
