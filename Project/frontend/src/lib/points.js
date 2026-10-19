/** Each point is worth RM 1. Points can take the total down to zero but not below, in whole ringgit. */
export function pointsDiscount(points, subtotal, usePoints = true) {
  if (!usePoints) return 0;
  return Math.max(0, Math.min(points || 0, Math.floor(subtotal)));
}

export const CASHBACK_RATE = 0.1;
export const pointsEarned = (total) => Math.floor(total * CASHBACK_RATE);
