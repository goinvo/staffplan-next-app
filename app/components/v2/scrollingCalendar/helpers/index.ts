import { DateTime, Interval } from "luxon";

import { AssignmentType, MonthsDataType } from "../../../../typeInterfaces";

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

// TO DO: REFACTOR, when chaging date range still old data
export const calculateTotalActualHoursForAssignment = (
  assignment: AssignmentType
) => {
  const totalHours = assignment.workWeeks.reduce((sum, weekData) => {
    return sum + (weekData.actualHours || 0);
  }, 0);
  return totalHours;
};

export const calculateTotalEstimatedHoursForAssignment = (
  assignment: AssignmentType
) => {
  const totalHours = assignment.workWeeks.reduce((sum, weekData) => {
    return sum + (weekData.estimatedHours || 0);
  }, 0);
  return totalHours;
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

// export const groupWeeksByMonth = (
//   months: MonthsDataType[],
//   weeks: number[]
// ) => {
//   const groupedWeeks: { [key: string]: number[] } = {};
//   months.forEach((month) => {
//     const monthKey = DateTime.local(
//       month.year,
//       parseInt(month.monthLabel),
//       1
//     ).toFormat("MMM yyyy");
//     const start = DateTime.local(month.year, parseInt(month.monthLabel), 1);
//     const end = start.endOf("month");
//     const monthWeeks = weeks.filter((week) => {
//       const date = DateTime.fromObject({
//         weekYear: month.year,
//         weekNumber: week,
//       });
//       return date >= start && date <= end;
//     });
//     groupedWeeks[start.toFormat("MMM yyyy")] = monthWeeks;
//   });

//   return groupedWeeks;
// };

// show month /// refactor
// export const showYear = (monthData: MonthData) => {
//   return monthData.monthLabel === "1"
//     ? `${DateTime.fromFormat(monthData.monthLabel, "M").toFormat("MMM")} ${
//         monthData.year
//       }`
//     : DateTime.fromFormat(monthData.monthLabel, "M").toFormat("MMM");
// };

// grouped by clients
export const groupByClient = (data: any) => {
  return data.reduce((acc: any, item: any) => {
    const clientId = item.client.id;
    if (!acc[clientId]) {
      acc[clientId] = {
        client: item.client,
        projects: [],
      };
    }
    acc[clientId].projects.push(item.project);
    return acc;
  }, {});
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

// const getWeeksInMonth = (start: DateTime, end: DateTime): number[] => {
//   const weeks: number[] = [];

//   // Start of the first week of month
//   let currentWeek = start.startOf("week");

//   const endOfMonthWeek = end.endOf("week");
//   while (currentWeek <= endOfMonthWeek) {
//     if (currentWeek >= start.startOf("month") && currentWeek <= end) {
//       weeks.push(currentWeek.weekNumber);
//     }
//     currentWeek = currentWeek.plus({ weeks: 1 });
//   }

//   return weeks;
// };

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
// export const getMonthsWithWeeks = (startDate: any, endDate: any) => {
//   const start = DateTime.fromISO(startDate);
//   const end = DateTime.fromISO(endDate);

//   return Array.from(
//     { length: end.diff(start, "months").months + 1 },
//     (_, index) => {
//       const monthStart = start.plus({ months: index }).startOf("month");
//       const monthEnd = monthStart.endOf("month");
//       return {
//         monthLabel: monthStart.toFormat("M"),
//         year: start.year,
//         weeks: getWeeksInMonth(monthStart, monthEnd),
//       };
//     }
//   );
// };

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