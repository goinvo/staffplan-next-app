import { DateTime, Interval } from "luxon";
import { differenceInWeeks } from "date-fns";
import { WorkWeek } from "./components/workWeek";
import {
	AssignmentType,
	UserAssignmentDataType,
	WorkWeekType,
	UserAssignmentDataMapType,
	WorkWeekBlockMemberType,
} from "./typeInterfaces";
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

export function getDateFromWeekAndYear(cweek: number, year: number): Date {
	const firstDayOfYear = new Date(year, 0, 1);
	const dayOfWeek = firstDayOfYear.getDay();
	const firstMondayOfYear = new Date(year, 0, 1 + ((8 - dayOfWeek) % 7));
	return new Date(firstMondayOfYear.getFullYear(), firstMondayOfYear.getMonth(), firstMondayOfYear.getDate() + (cweek - 1) * 7);
}

export function matchWorkWeeks(prevWeeks: WorkWeekBlockMemberType[], currWeeks: WorkWeekBlockMemberType[]): WorkWeekBlockMemberType[] {
	const matchedWeeks: WorkWeekBlockMemberType[] = [];
	const usedIndices: boolean[] = new Array(currWeeks.length).fill(false);

	// Match items in the same index
	for (let i = 0; i < prevWeeks.length; i++) {
		const prevWeek = prevWeeks[i];
		const currIndex = currWeeks.findIndex((week, index) => week.workWeek.project && prevWeek.workWeek.project && week.workWeek.project.name === prevWeek.workWeek.project.name && !usedIndices[index]);
		if (currIndex !== -1) {
			matchedWeeks.push(currWeeks[currIndex]);
			usedIndices[currIndex] = true;
		}
	}

	// Add remaining unmatched items
	for (let i = 0; i < currWeeks.length; i++) {
		if (!usedIndices[i]) {
			matchedWeeks.push(currWeeks[i]);
		}
	}

	return matchedWeeks;
}

export function processUserAssignmentDataMap(userAssignmentDataMap: any): UserAssignmentDataMapType {
	const processedDataMap: UserAssignmentDataMapType = {};

	userAssignmentDataMap.currentCompany.users.forEach((user: any) => {
		const userId = user.id;
		processedDataMap[userId] = {};
		let maxTotalEstHours = 40;

		user.assignments.forEach((assignment: any) => {
			if (assignment.project.id && assignment.workWeeks.length > 0) {
				assignment.workWeeks.forEach((workWeek: any) => {
					if (!processedDataMap[userId][workWeek.year]) {
						processedDataMap[userId][workWeek.year] = {};
					}
					if (!processedDataMap[userId][workWeek.year][workWeek.cweek]) {
						processedDataMap[userId][workWeek.year][workWeek.cweek] = {};
					}

					let consecutivePrevWeeks = 0;

					// Check if the previous week is consecutive and update the consecutivePrevWeeks count
					if (
						processedDataMap[userId][workWeek.year][workWeek.cweek - 1] &&
						processedDataMap[userId][workWeek.year][workWeek.cweek - 1][assignment.project.id]
					) {
						const prevWeek = processedDataMap[userId][workWeek.year][workWeek.cweek - 1][assignment.project.id];
						consecutivePrevWeeks = prevWeek.consecutivePrevWeeks + 1;
						prevWeek.isLastConsecutiveWeek = false;
					}

					// Add the work week to the map
					processedDataMap[userId][workWeek.year][workWeek.cweek][assignment.project.id] = {
						workWeek: workWeek,
						consecutivePrevWeeks: consecutivePrevWeeks,
						isLastConsecutiveWeek: true,
						itemEstHoursOffset: 0,
						maxTotalEstHours: 40,
					};
				});
			}

			// Iterate through each given week and year to get projects for a given time, then calculate total est hours
			Object.keys(processedDataMap[userId]).forEach((year: string) => {
				const yearAsNumber = parseInt(year);
				
				Object.keys(processedDataMap[userId][yearAsNumber]).forEach((cweek) => {
					const cweekAsNumber = parseInt(cweek);
					const workWeeksByProject = processedDataMap[userId][yearAsNumber][cweekAsNumber];
					const projectIds = Object.keys(workWeeksByProject);
					let totalEstHours = 0;

					// Calculate the total estimated hours for the week
					projectIds.forEach((projectId) => {
						const workWeekBlock = workWeeksByProject[projectId];
						totalEstHours += workWeekBlock.workWeek.estimatedHours || 0;
					});

					// If the total estimated hours for the week is greater than 40, update the maxTotalEstHours
					if (totalEstHours > 40) {
						maxTotalEstHours = totalEstHours;
					}
				});
			});
		});

		// Update the maxTotalEstHours for each project under the user
		Object.keys(processedDataMap[userId]).forEach((year: string) => {
			const yearAsNumber = parseInt(year);
			
			Object.keys(processedDataMap[userId][yearAsNumber]).forEach((cweek) => {
				const cweekAsNumber = parseInt(cweek);
				const workWeeksByProject = processedDataMap[userId][yearAsNumber][cweekAsNumber];
				const projectIds = Object.keys(workWeeksByProject);

				// Update the maxTotalEstHours for each project
				projectIds.forEach((projectId) => {
					const workWeekBlock = workWeeksByProject[projectId];
					workWeekBlock.maxTotalEstHours = maxTotalEstHours;
				});
			});
		});
	});

	return processedDataMap;
}

export function getWorkWeeksForUserByWeekAndYear(
	userAssignmentDataMap: UserAssignmentDataMapType,
	userId: number,
	cweek: number,
	year: number
): WorkWeekBlockMemberType[] {
	const workWeeksBlocksByProject: WorkWeekBlockMemberType[] = [];

	if (
		userAssignmentDataMap[userId] &&
		userAssignmentDataMap[userId][year] &&
		userAssignmentDataMap[userId][year][cweek]
	) {
		for (const projectId in userAssignmentDataMap[userId][year][cweek]) {
			workWeeksBlocksByProject.push(userAssignmentDataMap[userId][year][cweek][projectId]);
		}
	}

	return workWeeksBlocksByProject;
}

// Draws a bar with rounded corners for the schedule
export const drawBar = (xOffset: number, yOffset: number,
	targetCornerRadius: number,
	barHeight: number, fullBarHeight: number, fullBarWidth: number,
	hasTopLeftConnection: boolean = false, hasTopRightConnection: boolean = true,
	key?: number) => {
	const cornerRadius = Math.min(targetCornerRadius, barHeight);
	const vLength = hasTopRightConnection ? barHeight + cornerRadius : barHeight - cornerRadius;
	const hLength = fullBarWidth - 2 * cornerRadius;

	const topSection = ("M " + xOffset + ", " + (hasTopLeftConnection ? (yOffset + fullBarHeight - barHeight - cornerRadius) : (yOffset + cornerRadius + (fullBarHeight - barHeight)))
		+ " a " + cornerRadius + "," + (hasTopLeftConnection ? (cornerRadius + " 0 0 0 " + cornerRadius + "," + cornerRadius) : (cornerRadius + " 0 0 1 " + cornerRadius + "," + (cornerRadius * -1)))
		+ " h " + hLength
		+ " a " + cornerRadius + "," + (hasTopRightConnection ? (cornerRadius + " 0 0 0 " + cornerRadius + "," + (cornerRadius * -1)) : (cornerRadius + " 0 0 1 " + cornerRadius + "," + cornerRadius))
	);

	return (
		<path key={key} d={topSection
			+ " v " + vLength + " h " + (fullBarWidth * -1) + " z"}
			fill="blue" />
	)

}