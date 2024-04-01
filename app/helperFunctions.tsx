import {
	ProjectDataMapType,
	UserAssignmentDataMapType,
	WorkWeekBlockMemberType,
} from "./typeInterfaces";
import _ from "lodash";

export function matchWorkWeeks(
	prevWeeks: WorkWeekBlockMemberType[],
	currWeeks: WorkWeekBlockMemberType[]
): WorkWeekBlockMemberType[] {
	const matchedWeeks: WorkWeekBlockMemberType[] = [];
	const usedIndices: boolean[] = new Array(currWeeks.length).fill(false);

	// Match items in the same index
	for (let i = 0; i < prevWeeks.length; i++) {
		const prevWeek = prevWeeks[i];
		const currIndex = currWeeks.findIndex(
			(week, index) =>
				week.workWeek.project &&
				prevWeek.workWeek.project &&
				week.workWeek.project.name === prevWeek.workWeek.project.name &&
				!usedIndices[index]
		);
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

export function matchWorkWeekBlocks(
	prevBlocks: WorkWeekBlockMemberType[],
	currentBlocks: WorkWeekBlockMemberType[]
): WorkWeekBlockMemberType[] {
	const matchedBlocks: WorkWeekBlockMemberType[] = [];
	const usedIndices: boolean[] = new Array(currentBlocks.length).fill(false);
	// Match blocks based on the project name in reverse order
	for (let i = prevBlocks.length - 1; i >= 0; i--) {
		const prevBlock = prevBlocks[i];
		const currentIndex = currentBlocks.findIndex(
			(block, index) =>
				block.workWeek.project?.name === prevBlock.workWeek.project?.name &&
				!usedIndices[index]
		);
		if (currentIndex !== -1) {
			matchedBlocks.push(currentBlocks[currentIndex]);
			usedIndices[currentIndex] = true;
		}
	}

	// Add remaining unmatched blocks from currentBlocks
	for (let i = 0; i < currentBlocks.length; i++) {
		if (!usedIndices[i]) {
			matchedBlocks.push(currentBlocks[i]);
		}
	}

	return matchedBlocks;
}

export function processUserAssignmentDataMap(
	userList: any
): UserAssignmentDataMapType {
	const processedDataMap: UserAssignmentDataMapType = {};

	userList.forEach((user: any) => {
		const userId = user.id;
		processedDataMap[userId] = {};

		user.assignments.forEach((assignment: any) => {
			if (assignment.project.id && assignment.workWeeks.length > 0) {
				processWorkWeeksForAssignment(processedDataMap, userId, assignment);
			}
		});
		updateMaxTotalEstHoursForAssignment(processedDataMap, userId);
	});

	return processedDataMap;
}

function processWorkWeeksForAssignment(
	processedDataMap: UserAssignmentDataMapType,
	userId: string,
	assignment: any
) {
	assignment.workWeeks.forEach((workWeek: any) => {
		const { year, cweek } = workWeek;

		_.setWith(processedDataMap, [userId, year, cweek], [], Object);

		const currentWeekBlocks = _.get(processedDataMap, [userId, year, cweek]);

		const prevWeekBlocks = _.get(
			processedDataMap,
			[userId, year, cweek - 1],
			[]
		).reverse();

		const consecutivePrevWeeks = getConsecutivePrevWeeksForAssignment(
			processedDataMap,
			userId,
			workWeek,
			assignment
		);

		const currentWorkWeekBlock: WorkWeekBlockMemberType = {
			workWeek,
			consecutivePrevWeeks,
			isLastConsecutiveWeek: true,
			itemEstHoursOffset: 0,
			maxTotalEstHours: 40,
		};

		currentWeekBlocks.push(currentWorkWeekBlock);

		// const bestMatchingOrder = matchWorkWeekBlocks(
		// 	prevWeekBlocks,
		// 	currentWeekBlocks
		// );

		_.set(processedDataMap, [userId, year, cweek], currentWeekBlocks);
	});
}

function getConsecutivePrevWeeksForAssignment(
	processedDataMap: UserAssignmentDataMapType,
	userId: string,
	workWeek: any,
	assignment: any
): number {
	const prevWeek = _.get(
		processedDataMap,
		[userId, workWeek.year, workWeek.cweek - 1],
		[]
	).find(
		(block: WorkWeekBlockMemberType) =>
			block.workWeek.project &&
			block.workWeek.project.name === assignment.project.name
	);

	if (prevWeek) {
		prevWeek.isLastConsecutiveWeek = false;
		return prevWeek.consecutivePrevWeeks + 1;
	}

	return 0;
}

function updateMaxTotalEstHoursForAssignment(
	processedDataMap: UserAssignmentDataMapType,
	userIdString: string
) {
	let maxTotalEstHours = 40;

	const userId = parseInt(userIdString);
	_.forOwn(
		processedDataMap[userId],
		(
			yearData: { [cweek: number]: WorkWeekBlockMemberType[] },
			year: string
		) => {
			_.forOwn(
				yearData,
				(workWeekBlocks: WorkWeekBlockMemberType[], cweek: string) => {
					const totalEstHours = _.sumBy(
						workWeekBlocks,
						(block) => block.workWeek.estimatedHours || 0
					);

					if (totalEstHours > maxTotalEstHours) {
						maxTotalEstHours = totalEstHours;
					}
				}
			);
		}
	);

	_.forOwn(
		processedDataMap[userId],
		(
			yearData: { [cweek: number]: WorkWeekBlockMemberType[] },
			year: string
		) => {
			_.forOwn(
				yearData,
				(workWeekBlocks: WorkWeekBlockMemberType[], cweek: string) => {
					workWeekBlocks.forEach((workWeekBlock) => {
						workWeekBlock.maxTotalEstHours = maxTotalEstHours;
					});
				}
			);
		}
	);
}
export function getWorkWeeksForUserByWeekAndYearForUsers(
	userAssignmentDataMap: UserAssignmentDataMapType,
	userId: number,
	cweek: number,
	year: number
): WorkWeekBlockMemberType[] {
	if (
		userAssignmentDataMap[userId] &&
		userAssignmentDataMap[userId][year] &&
		userAssignmentDataMap[userId][year][cweek]
	) {
		return userAssignmentDataMap[userId][year][cweek];
	}

	return [];
}

export function processProjectDataMap(projectsList: any): ProjectDataMapType {
	const processedDataMap: ProjectDataMapType = {};

	projectsList.forEach((project: any) => {
		const projectId = project.id;
		processedDataMap[projectId] = {};

		project.workWeeks.forEach((workWeek: any) => {
			processWorkWeeks(processedDataMap, projectId, workWeek);
		});

		updateMaxTotalEstHoursForProject(processedDataMap, projectId);
	});

	return processedDataMap;
}

function processWorkWeeks(
	processedDataMap: ProjectDataMapType,
	projectId: string,
	workWeek: any
) {
	const { year, cweek } = workWeek;

	_.set(processedDataMap, [projectId, year, cweek], []);

	const consecutivePrevWeeks = getConsecutivePrevWeeksForProject(processedDataMap, projectId, workWeek);
	const prevWeekBlocks = _.get(processedDataMap, [projectId, year, cweek - 1], []).reverse();
	const currentWeekBlocks = _.get(processedDataMap, [projectId, year, cweek], []);

	const currentWorkWeekBlock: WorkWeekBlockMemberType = {
		workWeek,
		consecutivePrevWeeks,
		isLastConsecutiveWeek: true,
		itemEstHoursOffset: 0,
		maxTotalEstHours: 40,
	};

	currentWeekBlocks.push(currentWorkWeekBlock);

	// const bestMatchingOrder = matchWorkWeekBlocks(prevWeekBlocks, currentWeekBlocks);

	_.set(processedDataMap, [projectId, year, cweek], currentWeekBlocks);
}

function getConsecutivePrevWeeksForProject(
	processedDataMap: ProjectDataMapType,
	projectId: string,
	workWeek: any
): number {
	const prevWeek = _.get(processedDataMap, [projectId, workWeek.year, workWeek.cweek - 1], []).find(
		(block: WorkWeekBlockMemberType) =>
			block.workWeek.user && block.workWeek.user.name === workWeek.user.name
	);

	if (prevWeek) {
		prevWeek.isLastConsecutiveWeek = false;
		return prevWeek.consecutivePrevWeeks + 1;
	}

	return 0;
}

function updateMaxTotalEstHoursForProject(processedDataMap: ProjectDataMapType, projectIdString: string) {
	let maxTotalEstHours = 40;
	const projectId = parseInt(projectIdString);

	_.forOwn(processedDataMap[projectId], (yearData: { [cweek: number]: WorkWeekBlockMemberType[] }, year: string) => {
		_.forOwn(yearData, (workWeekBlocks: WorkWeekBlockMemberType[], cweek: string) => {
			const totalEstHours = _.sumBy(workWeekBlocks, (block) => block.workWeek.estimatedHours || 0);

			if (totalEstHours > maxTotalEstHours) {
				maxTotalEstHours = totalEstHours;
			}
		});
	});

	_.forOwn(processedDataMap[projectId], (yearData: { [cweek: number]: WorkWeekBlockMemberType[] }, year: string) => {
		_.forOwn(yearData, (workWeekBlocks: WorkWeekBlockMemberType[], cweek: string) => {
			if (workWeekBlocks) {
				workWeekBlocks.forEach((workWeekBlock) => {
					workWeekBlock.maxTotalEstHours = maxTotalEstHours;
				});
			}

		});
	});
}

export function getWorkWeeksForProjectByWeekAndYearForProjects(
	projectDataMap: ProjectDataMapType,
	projectId: number,
	cweek: number,
	year: number
): WorkWeekBlockMemberType[] {
	if (
		projectDataMap[projectId] &&
		projectDataMap[projectId][year] &&
		projectDataMap[projectId][year][cweek]
	) {
		return projectDataMap[projectId][year][cweek];
	}

	return [];
}

export const drawBars = (
	workWeekBlocks: WorkWeekBlockMemberType[],
	width?: number,
	height?: number,
	gap: number = 4,
	cornerRadius = 6
) => {
	if (!width || !height) {
		return;
	}

	return (
		<div className="absolute bottom-0 z-10">
			{workWeekBlocks.map(
				(workWeekBlock: WorkWeekBlockMemberType, index: number) => {
					if (workWeekBlock.workWeek.estimatedHours && width && height) {
						const weekHeight =
							(height * workWeekBlock.workWeek.estimatedHours) /
							workWeekBlock.maxTotalEstHours;
						return (
							<div key={index}>
								<svg
									width={width + 1}
									height={weekHeight}
									xmlns="http://www.w3.org/2000/svg"
								>
									{drawBar(
										workWeekBlock.consecutivePrevWeeks != 0 ? 0 : gap,
										index * gap,
										cornerRadius,
										weekHeight,
										weekHeight,
										width + 1,
										workWeekBlock.consecutivePrevWeeks != 0,
										!workWeekBlock.isLastConsecutiveWeek
									)}
								</svg>
							</div>
						);
					}
				}
			)}
		</div>
	);
};

export const drawFTELabels = (
	workWeekBlocks: WorkWeekBlockMemberType[],
	width?: number,
	height?: number,
	gap: number = 4
) => {
	if (!width || !height) {
		return;
	}

	const labelPadding = 4;

	return (
		<div className="absolute bottom-0 z-30">
			{workWeekBlocks.map(
				(workWeekBlock: WorkWeekBlockMemberType, index: number) => {
					if (workWeekBlock.workWeek.estimatedHours && width && height) {
						const weekHeight =
							(height * workWeekBlock.workWeek.estimatedHours) /
							workWeekBlock.maxTotalEstHours;

						// Check if the previous week has the same project
						const hasSameProject = workWeekBlock.consecutivePrevWeeks != 0;

						return (
							<div
								key={index}
								className="relative z-30"
								style={{
									width: `${width}px`,
									height: `${weekHeight}px`,
									lineHeight: `${weekHeight}px`,
								}}
							>
								<div
									className="absolute text-bottom text-black text-xs"
									style={{
										left: `${labelPadding + gap}px`,
										bottom: `${labelPadding}px`,
									}}
								>
									{hasSameProject
										? ""
										: workWeekBlock.workWeek.project &&
											workWeekBlock.workWeek.project.name
											? workWeekBlock.workWeek.project.name
											: workWeekBlock.workWeek.user &&
												workWeekBlock.workWeek.user.name
												? workWeekBlock.workWeek.user.name
												: ""}
								</div>
							</div>
						);
					}
				}
			)}
		</div>
	);
};

// Draws a bar with rounded corners for the schedule
export const drawBar = (
	xOffset: number,
	yOffset: number,
	targetCornerRadius: number,
	barHeight: number,
	fullBarHeight: number,
	fullBarWidth: number,
	hasTopLeftConnection: boolean = false,
	hasTopRightConnection: boolean = true,
	key?: number
) => {
	const cornerRadius = Math.min(targetCornerRadius, barHeight);
	const vLength = hasTopRightConnection
		? barHeight + cornerRadius
		: barHeight - cornerRadius;
	const hLength = fullBarWidth - 2 * cornerRadius;

	const topSection =
		"M " +
		xOffset +
		", " +
		(hasTopLeftConnection
			? yOffset + fullBarHeight - barHeight - cornerRadius
			: yOffset + cornerRadius + (fullBarHeight - barHeight)) +
		" a " +
		cornerRadius +
		"," +
		(hasTopLeftConnection
			? cornerRadius + " 0 0 0 " + cornerRadius + "," + cornerRadius
			: cornerRadius + " 0 0 1 " + cornerRadius + "," + cornerRadius * -1) +
		" h " +
		hLength +
		" a " +
		cornerRadius +
		"," +
		(hasTopRightConnection
			? cornerRadius + " 0 0 0 " + cornerRadius + "," + cornerRadius * -1
			: cornerRadius + " 0 0 1 " + cornerRadius + "," + cornerRadius);

	return (
		<path
			key={key}
			d={topSection + " v " + vLength + " h " + fullBarWidth * -1 + " z"}
			fill="blue"
		/>
	);
};
