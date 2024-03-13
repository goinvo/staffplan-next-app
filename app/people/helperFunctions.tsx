import { DateTime, Interval } from "luxon";
import { WorkWeek } from "../components/workWeek";
import {
	AssignmentType,
	UserAssignmentDataType,
	WorkWeekType,
} from "../typeInterfaces";
// convert a human readable date to calendar week and year
export const parseProjectDates = (date: string) => {
	return {
		cweek: parseInt(DateTime.fromISO(date).toFormat("W")),
		year: parseInt(DateTime.fromISO(date).toFormat("kkkk")),
	};
};

// creates a human readable date from calendar week and year
export const parseWorkWeekDate = (weekYear: number, weekNumber: number) => {
	return DateTime.fromObject({ weekYear, weekNumber }).toISODate();
};

// returns an array of workWeeks with a formatted date added to the object
export const workWeekArr = (userAssignmentData: UserAssignmentDataType) => {
	return userAssignmentData?.userAssignments.flatMap(
		(assignment: AssignmentType) =>
			assignment.workWeeks.map((week: WorkWeekType) => {
				const date = parseWorkWeekDate(week.year, week.cweek);
				return { workWeek: week, date };
			})
	);
};

//an array of calendar dates, IF an assignment has a start and end date we set the workWeeks to follow those dates, otherwise we generate dates for current week thru end of year
export const calWeekDatesArr = (
	startDate: string | null,
	endDate: string | null
) => {
	return Interval.fromDateTimes(
		//we set the start date to monday to ensure it captures that week
		startDate
			? DateTime.fromISO(startDate).set({ weekday: 1 })
			: DateTime.now().set({ weekday: 1 }),
		//we set the end date to tuesday to ensure it captures the monday of that week
		endDate
			? DateTime.fromISO(endDate).set({ weekday: 2 })
			: DateTime.now().endOf("year").set({ weekday: 2 })
		// DateTime.now().endOf("year").set({ weekday: 1 })
	)
		.splitBy({ days: 1 })
		.filter((dur: Interval<true>) => dur.start.weekday === 1)
		.map((dur: Interval<true>) => dur.start.toISODate());
};

//compare work week data and array of weeks and generate components accordingly
export const workWeekComponentsArr = (
	assignmentStartDate: string | null,
	assignmentEndDate: string | null,
	calWeekDatesArr: (
		assignmentStartDate: string | null,
		assignmentEndDate: string | null
	) => string[],
	workWeekArr: { workWeek: WorkWeekType; date: string | null }[],
	assignmentId: number
) => {
	return calWeekDatesArr(assignmentStartDate, assignmentEndDate).map(
		(date: string) => {
			//if a workWeek entry exists for a date include it in the array of work week inputs
			const existingWeek = workWeekArr?.find(
				(week: { workWeek: WorkWeekType; date: string | null }) =>
					week.date == date && week.workWeek.assignmentId == assignmentId
			);
			if (existingWeek) {
				return (
					<WorkWeek key={existingWeek.date} workWeek={existingWeek.workWeek} />
				);
			}
			const { cweek, year } = parseProjectDates(date);
			return <WorkWeek key={date} workWeek={{ assignmentId, cweek, year }} />;
		}
	);
};

export const drawBar = (xOffset: number, targetCornerRadius: number, barHeight: number, fullBarHeight: number, fullBarWidth: number, hasLeftConnection: boolean = false, hasRightConnection: boolean = false) => {
	const cornerRadius = Math.min(targetCornerRadius, barHeight);
	if (!hasLeftConnection && !hasRightConnection) {
		return (
			<path d={"M " + xOffset + ", " + (cornerRadius + (fullBarHeight - barHeight))
				+ " a " + cornerRadius + "," + cornerRadius + " 0 0 1 " + cornerRadius + "," + (cornerRadius * -1)
				+ " h " + (fullBarWidth - 2 * cornerRadius) +
				" a " + cornerRadius + "," + cornerRadius + " 0 0 1 " + cornerRadius + "," + cornerRadius
				+ " v " + (barHeight - cornerRadius) + " h " + (fullBarWidth * -1) + " z"}
				fill="blue" />
		)
	} else if (hasLeftConnection && !hasRightConnection) {
		return (
			<path d={"M " + xOffset + ", " + (fullBarHeight - barHeight - cornerRadius)
				+ " a " + cornerRadius + "," + cornerRadius + " 0 0 0 " + cornerRadius + "," + cornerRadius
				+ " h " + (fullBarWidth - cornerRadius * 2)
				+ " a " + cornerRadius + "," + cornerRadius + " 0 0 1 " + cornerRadius + "," + cornerRadius
				+ " v " + (barHeight - cornerRadius) + " h " + (fullBarWidth * -1) + " z"}
				fill="blue" />
		)
	} else if (!hasLeftConnection && hasRightConnection) {
		return (
			<path d={"M " + xOffset + ", " + (cornerRadius + (fullBarHeight - barHeight))
				+ " a " + cornerRadius + "," + cornerRadius + " 0 0 1 " + cornerRadius + "," + (cornerRadius * -1)
				+ " h " + (fullBarWidth - 2 * cornerRadius) +
				" a " + cornerRadius + "," + cornerRadius + " 0 0 0 " + cornerRadius + "," + (cornerRadius * -1)
				+ " v " + (barHeight + cornerRadius) + " h " + (fullBarWidth * -1) + " z"}
				fill="blue" />
		)
	} else {
		return (
			<path d={"M " + xOffset + ", " + (fullBarHeight - barHeight - cornerRadius)
				+ " a " + cornerRadius + "," + cornerRadius + " 0 0 0 " + cornerRadius + "," + cornerRadius
				+ " h " + (fullBarWidth - 2 * cornerRadius) +
				" a " + cornerRadius + "," + cornerRadius + " 0 0 0 " + cornerRadius + "," + (cornerRadius * -1)
				+ " v " + (barHeight + cornerRadius) + " h " + (fullBarWidth * -1) + " z"}
				fill="blue" />
		)
	}

}