// Categories themselves are data (CategoriesModule). These enums describe how a product is sold.

export enum Unit {
  GRAM = 'GRAM',
  PIECE = 'PIECE',
}

export enum SellMode {
  FIXED_WEIGHT = 'FIXED_WEIGHT',
  VARIABLE_WEIGHT = 'VARIABLE_WEIGHT',
  PIECE = 'PIECE',
}

export enum CutType {
  CURRY_CUT = 'CURRY_CUT',
  BIRYANI_CUT = 'BIRYANI_CUT',
  BONELESS = 'BONELESS',
  WITH_BONE = 'WITH_BONE',
  WHOLE = 'WHOLE',
  BREAST = 'BREAST',
  LEG = 'LEG',
  WINGS = 'WINGS',
  LIVER = 'LIVER',
  GIZZARD = 'GIZZARD',
  MINCE = 'MINCE',
  SOUP_PIECES = 'SOUP_PIECES',
  FILLET = 'FILLET',
  STEAK = 'STEAK',
}

export enum PreparationOption {
  CLEANED = 'CLEANED',
  SKIN_ON = 'SKIN_ON',
  SKIN_OFF = 'SKIN_OFF',
  SMALL_PIECES = 'SMALL_PIECES',
  MEDIUM_PIECES = 'MEDIUM_PIECES',
  LARGE_PIECES = 'LARGE_PIECES',
  SCALED = 'SCALED',
  GUTTED = 'GUTTED',
}
