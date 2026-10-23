import { registerAs } from '@nestjs/config';
import { getEnv } from '../env.validation.js';

/** Platform-wide defaults. Per-vendor/shop overrides live in the database. */
export const businessConfig = registerAs('business', () => {
  const env = getEnv();
  return {
    defaultCommissionBps: env.DEFAULT_COMMISSION_BPS,
    stockReservationTtlMinutes: env.STOCK_RESERVATION_TTL_MINUTES,
    deliverySlotMinutes: env.DELIVERY_SLOT_MINUTES,
    defaultSlotCapacity: env.DEFAULT_SLOT_CAPACITY,
    weightVariancePercent: env.WEIGHT_VARIANCE_PERCENT,
  };
});
