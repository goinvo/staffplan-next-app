import { DateTime, Interval } from "luxon";

import { AssignmentType, MonthsDataType } from "../../../../typeInterfaces";

// TO DO: REFACTOR, when chaging date range still old data
export const calculateTotalHoursForAssignment = (
  assignment: AssignmentType
) => {
  const totalHours = assignment.workWeeks.reduce((sum, weekData) => {
    return sum + (weekData.actualHours || 0);
  }, 0);

  return totalHours;
};

export const calculateTotalHours = (assignments: AssignmentType[]) => {
  const totalHours: { [week: number]: number } = {};

  assignments?.forEach((assignment) => {
    assignment.workWeeks.forEach((weekData) => {
      if (!totalHours[weekData.cweek]) {
        totalHours[weekData.cweek] = 0;
      }
      totalHours[weekData.cweek] += weekData.actualHours || 0;
    });
  });
  return totalHours;
};

export const groupWeeksByMonth = (
  months: MonthsDataType[],
  weeks: number[]
) => {
  const groupedWeeks: { [key: string]: number[] } = {};
  // const groupedWeeks: number[][] = [];
  months.forEach((month) => {
    const monthKey = DateTime.local(
      month.year,
      parseInt(month.monthLabel),
      1
    ).toFormat("MMM yyyy");
    const start = DateTime.local(month.year, parseInt(month.monthLabel), 1);
    const end = start.endOf("month");
    const monthWeeks = weeks.filter((week) => {
      const date = DateTime.fromObject({
        weekYear: month.year,
        weekNumber: week,
      });
      return date >= start && date <= end;
    });
    // groupedWeeks.push(monthWeeks);
    groupedWeeks[start.toFormat("MMM yyyy")] = monthWeeks;
  });

  return groupedWeeks;
};

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
