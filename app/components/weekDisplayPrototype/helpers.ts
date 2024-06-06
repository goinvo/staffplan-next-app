import { DateTime } from "luxon";
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

    return { mondays, cweeks,year: start.year};
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

export const getAssignmentcWeeks = (startDate: any, endDate:any) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    const cweeks = Array.from(
        { length: end.diff(start, "days").days + 1 },
        (_, dayIndex) => {
            const day = start.plus({ days: dayIndex });
            return day.weekday === 1 ? day.weekNumber : null;
        }
    ).filter((week) => week !== null);

    return { cweeks,year: start.year};
};