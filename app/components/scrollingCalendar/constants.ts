export enum MONTS_PER_SCREEN_SIZE {
  MOBILE,
  X_SMALL,
  SMALL,
  MEDIUM,
  LARGE,
  X_LARGE,
}

type MonthsCount = {
  [key in MONTS_PER_SCREEN_SIZE]: number;
};

export const MONTHS_COUNT: MonthsCount = {
  [MONTS_PER_SCREEN_SIZE.MOBILE]: 1,
  [MONTS_PER_SCREEN_SIZE.X_SMALL]: 9,
  [MONTS_PER_SCREEN_SIZE.SMALL]: 14,
  [MONTS_PER_SCREEN_SIZE.MEDIUM]: 18,
  [MONTS_PER_SCREEN_SIZE.LARGE]: 22,
  [MONTS_PER_SCREEN_SIZE.X_LARGE]: 27,
};

export const ACTUAL_HOURS = "actualHours";
export const ESTIMATED_HOURS = "estimatedHours";

export enum PROJECT_DATES_TYPE {
  STARTS_ON = "startsOn",
  ENDS_ON = "endsOn",
}
