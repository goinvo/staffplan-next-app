import { DateTime, Interval } from "luxon";
import {
  WorkWeekType,
  AssignmentType,
  MonthsDataType,
} from "@/app/typeInterfaces";
interface MonthData {
  monthLabel: string;
  year: number;
}
export const showYear = (monthData: MonthData) => {
  return monthData.monthLabel === "1"
    ? `${DateTime.fromFormat(monthData.monthLabel, "M").toFormat("MMM")} ${
        monthData.year
      }`
    : DateTime.fromFormat(monthData.monthLabel, "M").toFormat("MMM");
};

export const getMondays = (startDate: any) => {
  const start = DateTime.fromISO(startDate);
  const end = start.endOf("month");

  const mondays = Array.from(
    { length: end.diff(start, "days").days + 1 },
    (_, dayIndex) => {
      const day = start.plus({ days: dayIndex });
      return day.weekday === 1 ? day.day : null;
    }
  ).filter((day) => day !== null);

  const cweeks = Array.from(
    { length: end.diff(start, "days").days + 1 },
    (_, dayIndex) => {
      const day = start.plus({ days: dayIndex });
      return day.weekday === 1 ? day.weekNumber : null;
    }
  ).filter((week) => week !== null);

  return { mondays, cweeks, year: start.year };
};

export const getMonths = (startDate: any, endDate: any) => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  return Array.from(
    { length: end.diff(start, "months").months + 1 },
    (_, index) => {
      const monthStart = start.plus({ months: index }).startOf("month");
      return {
        monthLabel: monthStart.toFormat("M"),
        year: start.year,
      };
    }
  );
};

export const getAssignmentcWeeks = (startDate: any, endDate: any) => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  const cweeks = Array.from(
    { length: end.diff(start, "days").days + 1 },
    (_, dayIndex) => {
      const day = start.plus({ days: dayIndex });
      return day.weekday === 1 ? day.weekNumber : null;
    }
  ).filter((week) => week !== null);

  return { cweeks, year: start.year };
};

export const assignmentContainsCWeek = (
  assignment: any,
  cweek: number,
  year: number
) => {
  if (assignment.startsOn && assignment.endsOn) {
    const start = DateTime.fromISO(assignment.startsOn);
    const end = DateTime.fromISO(assignment.endsOn);
    const interval = Interval.fromDateTimes(start, end);

    const dateFromWeek = DateTime.fromObject({
      weekYear: year,
      weekNumber: cweek,
    });
    const assignmentContainsDate = interval.contains(dateFromWeek);
    return assignmentContainsDate;
  }
  if (assignment.startsOn && !assignment.endsOn) {
    const start = DateTime.fromISO(assignment.startsOn);
    const dateFromWeek = DateTime.fromObject({
      weekYear: year,
      weekNumber: cweek,
    });
    return start <= dateFromWeek;
  }
  return false;
};

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
  assignments: AssignmentType | AssignmentType[]
) => {
  const totalHours: { [key: string]: number } = {};
  const proposedHours: { [key: string]: number } = {};
  let maxTotalHours = 0;

  const calculateAssignment = (assignment: AssignmentType) => {
    assignment.workWeeks.forEach((weekData) => {
      const key = `${weekData.year}-${weekData.cweek}`;
      if (!totalHours[key]) {
        totalHours[key] = 0;
      }
      totalHours[key] += weekData.actualHours || 0;

      if (assignment.status === "proposed") {
        if (!proposedHours[key]) {
          proposedHours[key] = 0;
        }
        proposedHours[key] += weekData.actualHours || 0;
      }
      if (totalHours[key] > maxTotalHours) {
        maxTotalHours = totalHours[key];
      }
    });
  };

  if (Array.isArray(assignments)) {
    assignments.forEach(calculateAssignment);
  } else {
    calculateAssignment(assignments);
  }
  totalHours.maxTotalHours = maxTotalHours;

  return { totalHours, proposedHours };
};

export const getDisplayHours = (
  workWeek: WorkWeekType,
  totalEstimatedWeeklyHours: number
): number => {
  const actualHours = workWeek?.actualHours ?? 0;
  const estimatedHours = workWeek?.estimatedHours ?? 0;
  if (actualHours > 0) {
    return actualHours;
  } else if (actualHours === 0 && estimatedHours === 0) {
    return totalEstimatedWeeklyHours;
  } else {
    return estimatedHours;
  }
};

export const currentQuarter = Math.floor((DateTime.now().month - 1) / 3) + 1;
export const currentYear = DateTime.now().year;
export const currentWeek = getCurrentWeekOfYear();

export const getStartOfPreviousWeek = (): string => {
  const inputDate = DateTime.now();

  if (!inputDate.isValid) {
    throw new Error("Invalid ISO date provided");
  }
  const startOfWeek = inputDate.startOf("week");
  const oneWeekBefore = startOfWeek.minus({ weeks: 1 });

  return oneWeekBefore.toISODate();
};

export const getEndDateInterval = (
  startDate: string,
  weeks: number
): string => {
  const start = DateTime.fromISO(startDate);

  if (!start.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const futureDate = start.plus({ weeks });

  return futureDate.toISODate();
};

export const getWeeksPerScreen = (startDate: string, amountOfWeeks: number) => {
  if (!startDate) return [];
  const start = DateTime.fromISO(startDate);
  const endDateString = getEndDateInterval(startDate, amountOfWeeks);
  if (!endDateString) return [];

  const end = DateTime.fromISO(endDateString);

  const weeksByMonthMap: {
    [key: string]: {
      weekNumberOfTheYear: number;
      weekNumberOfTheMonth: number;
    }[];
  } = {};

  for (let day = start; day <= end; day = day.plus({ days: 1 })) {
    if (day.weekday === 1) {
      const month = day.toFormat("M yyyy");
      if (!weeksByMonthMap[month]) weeksByMonthMap[month] = [];

      const weekNumberOfTheYear = day.weekNumber;
      const weekNumberOfTheMonth = Math.ceil(day.day / 7);

      if (day.month === 12 && weekNumberOfTheYear === 1) {
        weeksByMonthMap[month].push({
          weekNumberOfTheYear: 53,
          weekNumberOfTheMonth,
        });
      } else {
        weeksByMonthMap[month].push({
          weekNumberOfTheYear,
          weekNumberOfTheMonth,
        });
      }
    }
  }
  const weeksByMonth = Object.keys(weeksByMonthMap).map((month) => {
    const [monthName, year] = month.split(" ");
    return {
      monthLabel: monthName,
      year: parseInt(year, 10),
      weeks: weeksByMonthMap[month],
    };
  });

  return weeksByMonth;
};

export const getDateOneWeekEarlier = (isoDate: string): string => {
  const date = DateTime.fromISO(isoDate);

  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const oneWeekEarlier = date.minus({ weeks: 1 });
  const isoDateOneWeekEarlier = oneWeekEarlier.toISODate();

  return isoDateOneWeekEarlier;
};

export const getDateOneWeekAfter = (isoDate: string): string => {
  const date = DateTime.fromISO(isoDate);

  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const oneWeekAfter = date.plus({ weeks: 1 });
  const isoDateOneWeekAfter = oneWeekAfter.toISODate();

  return isoDateOneWeekAfter;
};
