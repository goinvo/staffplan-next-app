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

const getWeeksInMonth = (start: DateTime, end: DateTime): number[] => {
  const weeks: number[] = [];

  let currentWeek = start.startOf("week");
  const endOfMonthWeek = end.endOf("week");

  while (currentWeek <= endOfMonthWeek) {
    if (currentWeek >= start.startOf("month") && currentWeek <= end) {
      const weekNumber = currentWeek.weekNumber;
      if (weekNumber === 1 && currentWeek.month === 12) {
        if (!weeks.includes(53)) {
          weeks.push(53);
        }
      } else if (!weeks.includes(weekNumber)) {
        weeks.push(weekNumber);
      }
    }
    currentWeek = currentWeek.plus({ weeks: 1 });
  }

  return weeks;
};

export const getMonthsWithWeeks = (
  startDate: any,
  endDate: any,
  monthsCount: number
) => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  const finalEnd = start
    .plus({ months: monthsCount })
    .minus({ days: 1 })
    .endOf("month")
    .toISO();
  const finalEndDate = DateTime.fromISO(finalEnd as string);

  return Array.from(
    { length: finalEndDate.diff(start, "months").months + 1 },
    (_, index) => {
      const monthStart = start.plus({ months: index }).startOf("month");
      const monthEnd = monthStart.endOf("month");
      return {
        monthLabel: monthStart.toFormat("M"),
        year: monthStart.year,
        weeks: getWeeksInMonth(monthStart, monthEnd),
      };
    }
  );
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
