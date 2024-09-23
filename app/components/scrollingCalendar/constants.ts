export enum MONTS_PER_SCREEN_SIZE {
  SMALL,
  MEDIUM,
  LARGE,
  X_LARGE,
}

type MonthsCount = {
  [key in MONTS_PER_SCREEN_SIZE]: number;
};

export const MONTHS_COUNT: MonthsCount = {
  [MONTS_PER_SCREEN_SIZE.SMALL]: 12,
  [MONTS_PER_SCREEN_SIZE.MEDIUM]: 17,
  [MONTS_PER_SCREEN_SIZE.LARGE]: 22,
  [MONTS_PER_SCREEN_SIZE.X_LARGE]: 27,
};

export const ACTUAL_HOURS = "actualHours";
export const ESTIMATED_HOURS = "estimatedHours";
