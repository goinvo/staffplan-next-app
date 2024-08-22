import { DateTime } from "luxon";

import { AssignmentType, MonthsDataType } from "../../../typeInterfaces";

export const getCurrentYear = () => DateTime.now().year;

export const getCurrentWeekOfYear = () => {
  const now = DateTime.local();
  const weekNumber = now.weekNumber;
  return weekNumber;
};

export const isBeforeWeek = (
  week: number,
  currentWeek: number,
  currentYear: number,
  month: MonthsDataType
) => {
  if (month.year < currentYear) {
    return true;
  }

  if (month.year === currentYear) {
    if (week === 1 && month.monthLabel === "12") {
      return false;
    }
    return week < currentWeek;
  }
  return false;
};

export const showMonthAndYear = (year: number, monthLabel: string) => {
  if (monthLabel === "1") {
    return DateTime.local(year, parseInt(monthLabel), 1).toFormat("MMM yyyy");
  }
  return DateTime.local(year, parseInt(monthLabel), 1).toFormat("MMM");
};

export const calculateTotalHoursPerWeek = (
  assignments: AssignmentType[],
  month?: MonthsDataType
) => {
  const totalHours: { [key: string]: number } = {};

  assignments?.forEach((assignment) => {
    assignment.workWeeks.forEach((weekData) => {
      const key = `${weekData.year}-${weekData.cweek}`;
      if (!totalHours[key]) {
        totalHours[key] = 0;
      }
      totalHours[key] += weekData.actualHours || 0;
    });
  });
  return totalHours;
};
