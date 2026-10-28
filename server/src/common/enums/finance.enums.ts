export enum PaymentMethod {
  COD = 'COD',
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
}

export enum InventoryMovementType {
  OPENING = 'OPENING',
  RECEIVED = 'RECEIVED',
  RESERVED = 'RESERVED',
  RELEASED = 'RELEASED',
  SOLD = 'SOLD',
  WASTAGE = 'WASTAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURNED = 'RETURNED',
}

export enum LedgerEntryType {
  SALE = 'SALE',
  COMMISSION = 'COMMISSION',
  DELIVERY_FEE = 'DELIVERY_FEE',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  PAYOUT = 'PAYOUT',
  REVERSAL = 'REVERSAL',
}

export enum LedgerDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT_PAISE = 'FLAT_PAISE',
}

