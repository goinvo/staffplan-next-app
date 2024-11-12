import { DateTime, Interval } from "luxon";
import { isNil } from "lodash";

import {
  WorkWeekType,
  AssignmentType,
  MonthsDataType,
  UserType,
  ProjectType,
  ClientType,
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
      const key = `${month.year}-${week.weekNumberOfTheYear}`;
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
          const weekWithinAssignmentDates = assignmentContainsCWeek(
            assignment,
            week.weekNumberOfTheYear,
            month.year
          );
          const weekExistsWithEstimatedHours = assignment.workWeeks?.some(
            (w) =>
              w.cweek === week.weekNumberOfTheYear &&
              w.year === month.year &&
              w.estimatedHours !== undefined &&
              w.estimatedHours !== null
          );
          if (weekWithinAssignmentDates && !weekExistsWithEstimatedHours) {
            const key = `${month.year}-${week.weekNumberOfTheYear}`;
            totalEstimatedHours[key] += assignment.estimatedWeeklyHours;

            if (assignment.status === "proposed") {
              proposedEstimatedHours[key] += assignment.estimatedWeeklyHours;
            }
            if (totalEstimatedHours[key] > maxTotalEstimatedHours) {
              maxTotalEstimatedHours = totalEstimatedHours[key];
            }

            if (proposedEstimatedHours[key] > maxProposedEstimatedHours) {
              maxProposedEstimatedHours = proposedEstimatedHours[key];
            }
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
  // Cause on initial screen load we start from previous week date
  if (amountOfWeeks === 1) {
    const nextMonday = DateTime.fromISO(startDate)
      .plus({ weeks: 1 })
      .startOf("week");
    let weekNumberOfTheYear = nextMonday.weekNumber;
    const weekNumberOfTheMonth = Math.ceil(nextMonday.day / 7);
    const monthLabel = nextMonday.toFormat("M");
    const year = nextMonday.year;

    if (weekNumberOfTheYear === 1 && nextMonday.month === 12) {
      weekNumberOfTheYear = 53;
    }
    return [
      {
        monthLabel,
        year,
        weeks: [
          {
            weekNumberOfTheYear,
            weekNumberOfTheMonth,
          },
        ],
      },
    ];
  }
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
  // Cause on initial screen load we start from previous week date
  if (amountOfWeeks === 1) {
    amountOfWeeks = 2;
  }
  const firstMonthPerView = months[0];
  const firstWeekPerView = firstMonthPerView.weeks[0];
  const firstISODate = getISODateFromWeek(
    firstMonthPerView.year,
    firstWeekPerView.weekNumberOfTheYear,
    Number(firstMonthPerView.monthLabel)
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
    lastWeekPerView.weekNumberOfTheYear,
    Number(lastMonthPerView.monthLabel)
  );
  if (months.length === 1 && lastMonthPerView.weeks.length === 1) {
    return lastISODate;
  }
  const date = DateTime.fromISO(lastISODate);

  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }

  const nextView = date.plus({ weeks: 1 });
  return nextView.toISODate();
};

const getLastMondayOfDecember = (year: number): DateTime => {
  let date = DateTime.local(year, 12, 31);
  while (date.weekday !== 1) {
    date = date.minus({ days: 1 });
  }
  return date;
};

export const getISODateFromWeek = (
  year: number,
  weekNumber: number,
  month?: number
): string => {
  if (!checkIfWeekExists(year, weekNumber)) {
    const lastWeekOfYear = DateTime.local(year, 12, 31).weekNumber;
    if (weekNumber > lastWeekOfYear) {
      weekNumber = lastWeekOfYear;
      if (month === 12) {
        const lastMondayInDecember = getLastMondayOfDecember(year);
        const isoDate = lastMondayInDecember.toISODate();
        if (isoDate) return isoDate;
      }
    }
  }

  const date = DateTime.fromObject({ weekYear: year, weekNumber });
  if (!date.isValid) {
    throw new Error("Invalid ISO date provided");
  }
  return date.toISODate();
};

export const filterWeeksForFillForward = (
  allWeeks: { cweek: number; year: number }[],
  targetCweek: number,
  targetYear: number,
  targetMonth: number,
  endsOnDate: string | null
) => {
  const filteredWeeks = allWeeks.filter((week) => {
    if (week.year > targetYear) return true;
    if (week.year === targetYear && week.cweek >= targetCweek) return true;
    return false;
  });

  // If the active week is earlier than the End date, fill weeks from the active week to (and including) the End date.
  if (endsOnDate) {
    const endsOnWeek = getWeekNumberAndYear(endsOnDate);
    if (
      targetYear < endsOnWeek.year ||
      (targetYear === endsOnWeek.year && targetCweek < endsOnWeek.weekNumber)
    ) {
      const startDate = getISODateFromWeek(
        targetYear,
        targetCweek,
        targetMonth
      );
      const filteredWeeksBeforeEndDate = getWeeksBetweenDates(
        startDate,
        endsOnDate
      );
      return filteredWeeksBeforeEndDate;
    }
  }
  return filteredWeeks;
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

export const tabbingAndArrowNavigation = (
  event: React.KeyboardEvent<HTMLInputElement>,
  rowIndex: number,
  cellIndex: number,
  inputRefs: React.MutableRefObject<
    Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>
  >,
  totalRows: number,
  isActual: boolean
) => {
  const estimatedArray = inputRefs.current[rowIndex][0];
  const actualArray = inputRefs.current[rowIndex][1];
  const totalInputsInRow = estimatedArray.length;

  const moveToNextInput = () => {
    if (!isActual) {
      if (cellIndex < totalInputsInRow - 1) {
        estimatedArray[cellIndex + 1]?.focus();
      }
    } else {
      if (cellIndex < totalInputsInRow - 1) {
        actualArray[cellIndex + 1]?.focus();
      }
    }
  };

  const moveToPrevInput = () => {
    if (!isActual) {
      if (cellIndex > 0) {
        estimatedArray[cellIndex - 1]?.focus();
      } else if (rowIndex > 0) {
        const lastActualPrevRow =
          inputRefs.current[rowIndex - 1][1][totalInputsInRow - 1];
        lastActualPrevRow?.focus();
      }
    } else {
      if (cellIndex > 0) {
        actualArray[cellIndex - 1]?.focus();
      } else if (rowIndex > 0) {
        const lastEstimatedPrevRow =
          inputRefs.current[rowIndex - 1][0][totalInputsInRow - 1];
        lastEstimatedPrevRow?.focus();
      }
    }
  };

  const moveDown = () => {
    if (isActual) {
      if (rowIndex < totalRows - 1) {
        const nextEstimatedInput =
          inputRefs.current[rowIndex + 1][0][cellIndex];
        nextEstimatedInput?.focus();
      }
    } else {
      const nextActualInput =
        actualArray[cellIndex] ||
        inputRefs.current[rowIndex + 1]?.[0]?.[cellIndex];
      nextActualInput?.focus();
    }
  };

  const moveUp = () => {
    const prevEstimatedInput = isActual
      ? estimatedArray[cellIndex]
      : inputRefs.current[rowIndex - 1]?.[1]?.[cellIndex] ||
        inputRefs.current[rowIndex - 1]?.[0]?.[cellIndex];
    prevEstimatedInput?.focus();
  };

  const cursorPosition = event.currentTarget.selectionStart;
  const inputLength = event.currentTarget.value.length;

  switch (event.key) {
    case "ArrowRight": {
      if (cursorPosition === inputLength) {
        event.preventDefault();
        moveToNextInput();
      }
      break;
    }

    case "ArrowLeft": {
      if (cursorPosition === 0) {
        event.preventDefault();
        moveToPrevInput();
      }
      break;
    }
    case "Tab": {
      event.preventDefault();
      moveToNextInput();
      break;
    }

    case "ArrowDown": {
      event.preventDefault();
      moveDown();
      break;
    }

    case "ArrowUp": {
      event.preventDefault();
      moveUp();
      break;
    }

    default:
      break;
  }
};

export const weekNumberToDateRange = (
  weekNumber: number,
  year: number
): string => {
  const firstDayOfYear = DateTime.fromObject({ year: year, month: 1, day: 1 });

  const startOfWeek = firstDayOfYear
    .plus({ weeks: weekNumber - 1 })
    .startOf("week");

  const endOfWeek = startOfWeek.plus({ days: 6 });

  const formattedStart = startOfWeek.toFormat("dd.LL.yyyy");
  const formattedEnd = endOfWeek.toFormat("dd.LL.yyyy");

  return `${formattedStart} - ${formattedEnd}`;
};

export const getWeeksBetweenDates = (startDate: string, endDate: string) => {
  let start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const weeks = [];

  if (start.weekday !== 1) {
    start = start.plus({ days: 8 - start.weekday });
  }

  let current = start;
  while (current <= end) {
    let weekNumber = current.weekNumber;
    const year = current.year;

    if (current.month === 12 && weekNumber === 1) {
      const lastDayOfDecember = DateTime.fromObject({
        year: current.year,
        month: 12,
        day: 31,
      });
      const lastWeekOfDecember = lastDayOfDecember.weekNumber;
      if (weekNumber === lastWeekOfDecember) {
        weekNumber = 53;
      }
    }

    weeks.push({ cweek: weekNumber, year });
    current = current.plus({ weeks: 1 });
  }

  return weeks;
};

interface WeeklyHoursSummary {
  week: number;
  year: number;
  totalActualHours: number;
  totalEstimatedHours: number;
}

export const sortWeeklyHoursByDate = (
  weeklyHours: WeeklyHoursSummary[]
): WeeklyHoursSummary[] => {
  return weeklyHours.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.week - b.week;
  });
};

export const calculateWeeklyHoursForCSV = (assignments: AssignmentType[]) => {
  const weeklyHoursMap: { [key: string]: WeeklyHoursSummary } = {};

  assignments.forEach((assignment) => {
    if (
      assignment.startsOn &&
      assignment.endsOn &&
      assignment.estimatedWeeklyHours
    ) {
      const weeksBetween = getWeeksBetweenDates(
        assignment.startsOn,
        assignment.endsOn
      );

      weeksBetween.forEach((week) => {
        const key = `${week.year}-${week.cweek}`;

        const isWeekInWorkWeeks = assignment.workWeeks.some(
          (w) =>
            w.cweek === week.cweek && w.year === week.year && w.estimatedHours
        );

        if (!isWeekInWorkWeeks) {
          if (!weeklyHoursMap[key]) {
            weeklyHoursMap[key] = {
              week: week.cweek,
              year: week.year,
              totalActualHours: 0,
              totalEstimatedHours: 0,
            };
          }

          weeklyHoursMap[key].totalEstimatedHours +=
            assignment.estimatedWeeklyHours;
        }
      });
    }
    assignment.workWeeks.forEach((week) => {
      const key = `${week.year}-${week.cweek}`;

      if (!weeklyHoursMap[key]) {
        weeklyHoursMap[key] = {
          week: week.cweek,
          year: week.year,
          totalActualHours: 0,
          totalEstimatedHours: 0,
        };
      }

      weeklyHoursMap[key].totalActualHours += week.actualHours || 0;
      weeklyHoursMap[key].totalEstimatedHours += week.estimatedHours || 0;
    });
  });

  return Object.values(weeklyHoursMap);
};

export const calculateWeeklyHoursPerProjectForCSV = (
  weeklyHours: WeeklyHoursSummary[]
) => {
  return weeklyHours.reduce(
    (acc, week) => {
      acc.totalEstimatedHoursPerProject += week.totalEstimatedHours || 0;
      acc.totalActualHoursPerProject += week.totalActualHours || 0;
      return acc;
    },
    { totalEstimatedHoursPerProject: 0, totalActualHoursPerProject: 0 }
  );
};

export const groupAndSumWeeksByMonthForUsers = (
  assignments: AssignmentType[]
) => {
  const usersByMonth: {
    userId: string | number;
    userName: string;
    months: {
      monthLabel: string;
      monthNumber: number;
      year: number;
      totalActualHours: number;
      totalEstimatedHours: number;
    }[];
  }[] = [];

  assignments.forEach((assignment) => {
    const userId = assignment?.assignedUser?.id || "";
    const userName = assignment?.assignedUser?.name || "TBD user";
    let userGroup = usersByMonth.find((user) => user.userId === userId) || {
      userId,
      userName,
      months: [],
    };
    if (!usersByMonth.some((user) => user.userId === userId)) {
      usersByMonth.push(userGroup);
    }

    assignment.workWeeks.forEach((week) => {
      const startOfWeek = DateTime.fromObject({ year: week.year })
        .plus({ weeks: week.cweek - 1 })
        .startOf("week");
      const month = startOfWeek.monthLong;
      const monthNumber = startOfWeek.month;
      const year = startOfWeek.year;
      const key = `${month} ${year}`;

      let monthGroup = userGroup.months.find(
        (group) => group.monthLabel === key
      );

      if (!monthGroup) {
        monthGroup = {
          monthLabel: key,
          monthNumber,
          year,
          totalActualHours: 0,
          totalEstimatedHours: 0,
        };
        userGroup.months.push(monthGroup);
      }

      monthGroup.totalActualHours += week.actualHours || 0;
      monthGroup.totalEstimatedHours += week.estimatedHours || 0;
    });

    if (
      assignment.startsOn &&
      assignment.endsOn &&
      assignment.estimatedWeeklyHours
    ) {
      const weeksBetween = getWeeksBetweenDates(
        assignment.startsOn,
        assignment.endsOn
      );

      weeksBetween.forEach((week) => {
        const startOfWeek = DateTime.fromObject({ year: week.year })
          .plus({ weeks: week.cweek - 1 })
          .startOf("week");
        const month = startOfWeek.monthLong;
        const monthNumber = startOfWeek.month;
        const year = startOfWeek.year;
        const key = `${month} ${year}`;
        const isWeekInWorkWeeks = assignment.workWeeks.some(
          (w) =>
            w.cweek === week.cweek && w.year === week.year && w.estimatedHours
        );

        if (!isWeekInWorkWeeks) {
          let monthGroup = userGroup.months.find(
            (group) => group.monthLabel === key
          );
          if (!monthGroup) {
            monthGroup = {
              monthLabel: key,
              monthNumber,
              year,
              totalActualHours: 0,
              totalEstimatedHours: 0,
            };
            userGroup.months.push(monthGroup);
          }
          monthGroup.totalEstimatedHours += assignment.estimatedWeeklyHours;
        }
      });
    }
  });

  usersByMonth.forEach((userGroup) => {
    userGroup.months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNumber - b.monthNumber;
    });
  });

  return usersByMonth;
};

export const checkIfWeekExists = (
  year: number,
  weekNumber: number
): boolean => {
  const date = DateTime.fromObject({ weekYear: year, weekNumber });
  return date.isValid;
};

export const updateUserAssignments = (
  userList: UserType[],
  selectedUserId: number | string,
  assignmentId: number,
  updatedWorkWeeks: WorkWeekType[]
): UserType[] => {
  return userList.map((user) => {
    if (user.id?.toString() === selectedUserId.toString()) {
      const updatedAssignments = user.assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            workWeeks: updatedWorkWeeks,
          };
        }
        return assignment;
      });

      return {
        ...user,
        assignments: updatedAssignments,
      };
    }
    return user;
  });
};

export const updateProjectAssignments = (
  projectList: ProjectType[],
  projectId: string | number,
  assignmentId: number,
  updatedWorkWeeks: WorkWeekType[]
): ProjectType[] => {
  const projectIndex = projectList.findIndex(
    (project) => project.id.toString() === projectId.toString()
  );

  if (projectIndex !== -1) {
    const project = projectList[projectIndex];

    if (project.assignments && project.assignments.length > 0) {
      const assignmentIndex = project.assignments.findIndex(
        (assignment) => assignment.id === assignmentId
      );

      if (assignmentIndex !== -1) {
        const updatedAssignment: AssignmentType = {
          ...project.assignments[assignmentIndex],
          workWeeks: updatedWorkWeeks,
        };

        const updatedAssignments = [...project.assignments];
        updatedAssignments[assignmentIndex] = updatedAssignment;

        const updatedProject: ProjectType = {
          ...project,
          assignments: updatedAssignments,
        };

        const updatedProjectList = [...projectList];
        updatedProjectList[projectIndex] = updatedProject;

        return updatedProjectList;
      }
    }
  }
  return projectList;
};

export const updateOrInsertWorkWeekInProject = (
  projectList: ProjectType[],
  projectId: number | string,
  assignmentId: number,
  workWeek: WorkWeekType
): ProjectType[] => {
  return projectList.map((project) => {
    if (project.id.toString() === projectId.toString()) {
      if (project.assignments && project.assignments.length > 0) {
        const updatedAssignments = project.assignments.map((assignment) => {
          if (assignment.id.toString() === assignmentId.toString()) {
            const workWeekIndex = assignment.workWeeks.findIndex(
              (week) =>
                week.cweek === workWeek.cweek && week.year === workWeek.year
            );
            let updatedWorkWeeks;
            if (workWeekIndex !== -1) {
              updatedWorkWeeks = [...assignment.workWeeks];
              updatedWorkWeeks[workWeekIndex] = {
                ...assignment.workWeeks[workWeekIndex],
                ...workWeek,
              };
            } else {
              updatedWorkWeeks = [...assignment.workWeeks, workWeek];
            }
            const canBeDeleted = !updatedWorkWeeks.some(
              (week) => (week.actualHours ?? 0) > 0
            );
            const updatedFields = {
              workWeeks: updatedWorkWeeks,
              canBeDeleted: canBeDeleted,
            };
            return {
              ...assignment,
              ...updatedFields,
            };
          }
          return assignment;
        });

        return {
          ...project,
          assignments: updatedAssignments,
        };
      }
      return project;
    }

    return project;
  });
};

export const updateOrInsertWorkWeek = (
  userList: UserType[],
  userId: string | number,
  assignmentId: number,
  workWeek: WorkWeekType
): UserType[] => {
  return userList.map((user) => {
    if (user.id?.toString() === userId.toString()) {
      const updatedAssignments = user.assignments.map((assignment) => {
        if (assignment.id.toString() === assignmentId.toString()) {
          const workWeekIndex = assignment.workWeeks.findIndex(
            (week) =>
              week.cweek === workWeek.cweek && week.year === workWeek.year
          );

          let updatedWorkWeeks;
          if (workWeekIndex !== -1) {
            updatedWorkWeeks = [...assignment.workWeeks];
            updatedWorkWeeks[workWeekIndex] = {
              ...assignment.workWeeks[workWeekIndex],
              ...workWeek,
            };
          } else {
            updatedWorkWeeks = [...assignment.workWeeks, workWeek];
          }
          return {
            ...assignment,
            workWeeks: updatedWorkWeeks,
          };
        }
        return assignment;
      });

      return {
        ...user,
        assignments: updatedAssignments,
      };
    }

    return user;
  });
};

export const getClientProjects = (
  clientList: ClientType[],
  clientId: string | number
) => {
  const client = clientList?.find((client) => client.id === clientId);
  return client?.projects ?? [];
};

export const filterUnassignedProjectsForUser = (
  projects: ProjectType[],
  userId: string
) => {
  return projects?.filter((project) => {
    const isUserAssigned = project?.assignments?.some(
      (assignment) => String(assignment?.assignedUser?.id) === String(userId)
    );
    return !isUserAssigned;
  });
};

export const calculatePlan = (
  assignment: AssignmentType,
  options: { isFuture: boolean }
): number => {
  const { isFuture } = options;
  const now = DateTime.now().startOf("week");

  const totalFromWorkWeeks = assignment.workWeeks.reduce((total, workWeek) => {
    const workWeekStart = DateTime.fromObject({
      weekYear: workWeek.year,
      weekNumber: workWeek.cweek,
    }).startOf("week");
    const isRelevantWeek = isFuture
      ? workWeekStart >= now.plus({ weeks: 1 })
      : workWeekStart <= now;

    if (!isNil(workWeek.estimatedHours) && isRelevantWeek) {
      return total + workWeek.estimatedHours;
    }
    return total;
  }, 0);

  if (assignment?.startsOn) {
    const start = DateTime.fromISO(assignment.startsOn).startOf("week");
    const end = assignment.endsOn
      ? DateTime.fromISO(assignment.endsOn).endOf("week")
      : now;

    const weeks: { weekNumber: number; year: number }[] = [];
    let cursor = start;

    while (cursor <= end) {
      const weekNumber = cursor.weekNumber;
      const year = cursor.year;

      if (assignmentContainsCWeek(assignment, weekNumber, year)) {
        if (isFuture ? cursor >= now.plus({ weeks: 1 }) : cursor <= now) {
          weeks.push({ weekNumber, year });
        }
      }
      cursor = cursor.plus({ weeks: 1 });
    }

    const additionalHours = weeks.reduce((total, week) => {
      const matchingWorkWeek = assignment.workWeeks.find(
        (workWeek) =>
          workWeek.cweek === week.weekNumber &&
          workWeek.year === week.year &&
          !isNil(workWeek.estimatedHours)
      );

      if (!matchingWorkWeek) {
        return total + (assignment.estimatedWeeklyHours ?? 0);
      }
      return total;
    }, 0);

    return totalFromWorkWeeks + additionalHours;
  }

  return totalFromWorkWeeks;
};

export const calculatePlannedHoursPerProject = (
  project: ProjectType
): number => {
  if (!project?.assignments) {
    return 0;
  }
  return project?.assignments?.reduce((totalAssignments, assignment) => {
    let totalForAssignment = assignment.workWeeks.reduce((total, workWeek) => {
      if (!isNil(workWeek.estimatedHours)) {
        return total + workWeek.estimatedHours;
      }
      return total;
    }, 0);
    if (
      assignment.estimatedWeeklyHours &&
      assignment.startsOn &&
      assignment.endsOn
    ) {
      const start = DateTime.fromISO(assignment.startsOn).startOf("week");
      const end = DateTime.fromISO(assignment.endsOn).endOf("week");
      let cursor = start;

      while (cursor <= end) {
        const weekNumber = cursor.weekNumber;
        const year = cursor.year;

        if (assignmentContainsCWeek(assignment, weekNumber, year)) {
          const matchingWorkWeek = assignment.workWeeks.find(
            (workWeek) =>
              workWeek.cweek === weekNumber && workWeek.year === year
          );

          if (!matchingWorkWeek || isNil(matchingWorkWeek.estimatedHours)) {
            totalForAssignment += assignment.estimatedWeeklyHours;
          }
        }

        cursor = cursor.plus({ weeks: 1 });
      }
    }

    return totalAssignments + totalForAssignment;
  }, 0);
};

export const getWeekNumberAndYear = (
  dateString: string
): {
  weekNumber: number;
  year: number;
} => {
  const date = DateTime.fromISO(dateString, { zone: "utc" });

  if (!date.isValid) {
    throw new Error("Invalid date format. Use ISO string format (YYYY-MM-DD).");
  }

  const monday = date.startOf("week");
  let weekNumber = monday.weekNumber;
  if (monday.month === 12 && weekNumber === 1) {
    weekNumber = 53;
  }
  return {
    weekNumber: weekNumber,
    year: monday.year,
  };
};

export const calculateTotalHoursForApprove = (
  assignments: AssignmentType | AssignmentType[],
  months: MonthsDataType[]
) => {
  const totalHoursForApprove: { [key: string]: number } = {};

  months.forEach((month) => {
    month.weeks.forEach((week) => {
      const key = `${month.year}-${week.weekNumberOfTheYear}`;
      totalHoursForApprove[key] = totalHoursForApprove[key] || 0;
    });
  });

  const calculateAssignment = (assignment: AssignmentType) => {
    if (assignment.estimatedWeeklyHours) {
      months.forEach((month) => {
        month.weeks.forEach((week) => {
          const weekExistsWithEstimatedHours = assignment.workWeeks?.some(
            (w) =>
              w.cweek === week.weekNumberOfTheYear &&
              w.year === month.year &&
              w.actualHours !== undefined &&
              w.actualHours !== null
          );
          if (!weekExistsWithEstimatedHours) {
            const key = `${month.year}-${week.weekNumberOfTheYear}`;
            totalHoursForApprove[key] += assignment.estimatedWeeklyHours;
          }
        });
      });
    }
    assignment.workWeeks.forEach((weekData) => {
      const key = `${weekData.year}-${weekData.cweek}`;
      if (!totalHoursForApprove[key]) {
        totalHoursForApprove[key] = 0;
      }
      totalHoursForApprove[key] += !isNil(weekData?.actualHours)
        ? weekData.actualHours
        : assignment?.estimatedWeeklyHours || 0;
    });
  };

  if (Array.isArray(assignments)) {
    assignments.forEach(calculateAssignment);
  } else {
    calculateAssignment(assignments);
  }

  return totalHoursForApprove;
};
