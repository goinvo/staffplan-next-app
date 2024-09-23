import { DateTime, Interval } from "luxon";
import {
  WorkWeekType,
  AssignmentType,
  MonthsDataType,
} from "@/app/typeInterfaces";
import { ACTUAL_HOURS } from "./constants";

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

export const isBeforeWeek = (week: number, month: MonthsDataType) => {
  const currentWeek = getCurrentWeekOfYear();
  const currentYear = getCurrentYear();

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
  assignments: AssignmentType | AssignmentType[],
  months: MonthsDataType[]
) => {
  const totalActualHours: { [key: string]: number } = {};
  const totalEstimatedHours: { [key: string]: number } = {};
  const proposedActualHours: { [key: string]: number } = {};
  const proposedEstimatedHours: { [key: string]: number } = {};

  let maxTotalActualHours = 0;
  let maxTotalEstimatedHours = 0;
  let maxProposedActualHours = 0;
  let maxProposedEstimatedHours = 0;

  months.forEach((month) => {
    month.weeks.forEach((week) => {
      const key = `${month.year}-${week}`;
      totalActualHours[key] = totalActualHours[key] || 0;
      totalEstimatedHours[key] = totalEstimatedHours[key] || 0;
      proposedActualHours[key] = proposedActualHours[key] || 0;
      proposedEstimatedHours[key] = proposedEstimatedHours[key] || 0;
    });
  });
  const calculateAssignment = (assignment: AssignmentType) => {
    if (assignment.estimatedWeeklyHours) {
      months.forEach((month) => {
        month.weeks.forEach((week) => {
          const key = `${month.year}-${week}`;
          totalEstimatedHours[key] += assignment.estimatedWeeklyHours;
          if (assignment.status === "proposed") {
            proposedEstimatedHours[key] += assignment.estimatedWeeklyHours;
          }
        });
      });
    }
    assignment.workWeeks.forEach((weekData) => {
      const key = `${weekData.year}-${weekData.cweek}`;
      if (!totalActualHours[key]) {
        totalActualHours[key] = 0;
      }
      totalActualHours[key] += weekData.actualHours || 0;

      if (!totalEstimatedHours[key]) {
        totalEstimatedHours[key] = 0;
      }
      totalEstimatedHours[key] += weekData.estimatedHours || 0;

      if (assignment.status === "proposed") {
        if (!proposedActualHours[key]) {
          proposedActualHours[key] = 0;
        }
        proposedActualHours[key] += weekData.actualHours || 0;

        if (!proposedEstimatedHours[key]) {
          proposedEstimatedHours[key] = 0;
        }
        proposedEstimatedHours[key] += weekData.estimatedHours || 0;
      }

      if (totalActualHours[key] > maxTotalActualHours) {
        maxTotalActualHours = totalActualHours[key];
      }

      if (totalEstimatedHours[key] > maxTotalEstimatedHours) {
        maxTotalEstimatedHours = totalEstimatedHours[key];
      }

      if (proposedActualHours[key] > maxProposedActualHours) {
        maxProposedActualHours = proposedActualHours[key];
      }

      if (proposedEstimatedHours[key] > maxProposedEstimatedHours) {
        maxProposedEstimatedHours = proposedEstimatedHours[key];
      }
    });
  };

  if (Array.isArray(assignments)) {
    assignments.forEach(calculateAssignment);
  } else {
    calculateAssignment(assignments);
  }

  const maxTotalHours = Math.max(
    maxTotalActualHours,
    maxTotalEstimatedHours,
    maxProposedActualHours,
    maxProposedEstimatedHours
  );

  totalActualHours.maxTotalActualHours = maxTotalActualHours;
  totalEstimatedHours.maxTotalEstimatedHours = maxTotalEstimatedHours;

  return {
    totalActualHours,
    totalEstimatedHours,
    proposedActualHours,
    proposedEstimatedHours,
    maxTotalHours,
  };
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

export const isPastOrCurrentWeek = (cweek: number, year: number) => {
  const currentDate = DateTime.now();
  const currentWeek = currentDate.weekNumber;

  return year < currentYear || (year === currentYear && cweek <= currentWeek);
};

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

export const getPrevWeeksPerView = (months: MonthsDataType[]): string => {
  let amountOfWeeks = 0;

  months.forEach((month) => {
    amountOfWeeks += month.weeks.length;
  });

  const firstMonthPerView = months[0];
  const firstWeekPerView = firstMonthPerView.weeks[0];
  const firstISODate = getISODateFromWeek(
    firstMonthPerView.year,
    firstWeekPerView.weekNumberOfTheYear
  );

  const date = DateTime.fromISO(firstISODate);

  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const prevView = date.minus({ weeks: amountOfWeeks });

  return prevView.toISODate();
};

export const getNextWeeksPerView = (months: MonthsDataType[]): string => {
  const lastMonthPerView = months[months.length - 1];
  const lastWeekPerView =
    lastMonthPerView.weeks[lastMonthPerView.weeks.length - 1];
  const lastISODate = getISODateFromWeek(
    lastMonthPerView.year,
    lastWeekPerView.weekNumberOfTheYear
  );

  const date = DateTime.fromISO(lastISODate);

  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const nextView = date.plus({ weeks: 1 });

  return nextView.toISODate();
};

export const getISODateFromWeek = (
  year: number,
  weekNumber: number
): string => {
  const date = DateTime.fromObject({ weekYear: year, weekNumber });
  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  return date.toISODate();
};

export const filterWeeksForFillForward = (
  allWeeks: { cweek: number; year: number }[],
  targetCweek: number,
  inputName: string
) => {
  const currentYear = getCurrentYear();
  const currentWeek = getCurrentWeekOfYear();

  if (inputName === ACTUAL_HOURS) {
    return allWeeks.filter(
      (week) =>
        week.cweek >= targetCweek &&
        week.year <= currentYear &&
        (week.year < currentYear || week.cweek <= currentWeek)
    );
  }

  return allWeeks.filter((week) => {
    if (week.year > currentYear) return true;
    if (week.year === currentYear && week.cweek >= targetCweek) return true;
    return false;
  });
};

export const getWeekNumbersPerScreen = (
  months: { weeks: { weekNumberOfTheYear: number }[]; year: number }[]
) => {
  return months.flatMap((month) =>
    month.weeks.map((week) => ({
      cweek: week.weekNumberOfTheYear,
      year: month.year,
    }))
  );
};
