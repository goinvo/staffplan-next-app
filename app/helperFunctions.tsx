import {
	AssignmentType,
	ProjectDataMapType,
	ProjectType,
	UserAssignmentDataMapType,
	UserType,
	WorkWeekBlockMemberType,
	ClassValue
} from "./typeInterfaces";
import { SORT_ORDER } from "./components/scrollingCalendar/constants";
import _ from "lodash";
import { DateTime, Interval } from "luxon";
import { calculateWeeklyHoursForCSV, calculateWeeklyHoursPerProjectForCSV, groupAndSumWeeksByMonthForUsers, sortWeeklyHoursByDate, weekNumberToDateRange } from "./components/scrollingCalendar/helpers";
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

		// Get the current week's work week blocks or initialize an empty array if it doesn't exist
		const currentWeekBlocks = _.get(
			processedDataMap,
			[userId, year, cweek],
			[]
		);

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

		const updatedCurrentWeekBlocks = [
			...currentWeekBlocks,
			currentWorkWeekBlock,
		];

		_.setWith(
			processedDataMap,
			[userId, year, cweek],
			updatedCurrentWeekBlocks
		);
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
					if (workWeekBlocks) {
						workWeekBlocks.forEach((workWeekBlock) => {
							workWeekBlock.maxTotalEstHours = maxTotalEstHours;
						});
					}
				}
			);
		}
	);
}
export function getWorkWeeksForUserByWeekAndYear(
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

	// Get the current week's work week blocks or initialize an empty array if it doesn't exist
	const currentWeekBlocks = _.get(
		processedDataMap,
		[projectId, year, cweek],
		[]
	);

	const consecutivePrevWeeks = getConsecutivePrevWeeksForProject(
		processedDataMap,
		projectId,
		workWeek
	);
	const prevWeekBlocks = _.get(
		processedDataMap,
		[projectId, year, cweek - 1],
		[]
	).reverse();

	const currentWorkWeekBlock: WorkWeekBlockMemberType = {
		workWeek,
		consecutivePrevWeeks,
		isLastConsecutiveWeek: true,
		itemEstHoursOffset: 0,
		maxTotalEstHours: 40,
	};

	// Add the current work week block to the current week's blocks
	const updatedCurrentWeekBlocks = [...currentWeekBlocks, currentWorkWeekBlock];

	// Update the processed data map with the updated current week's blocks
	_.setWith(
		processedDataMap,
		[projectId, year, cweek],
		updatedCurrentWeekBlocks
	);
}

function getConsecutivePrevWeeksForProject(
	processedDataMap: ProjectDataMapType,
	projectId: string,
	workWeek: any
): number {
	const prevWeek = _.get(
		processedDataMap,
		[projectId, workWeek.year, workWeek.cweek - 1],
		[]
	).find(
		(block: WorkWeekBlockMemberType) =>
			block.workWeek.user && block.workWeek.user.name === workWeek.user.name
	);

	if (prevWeek) {
		prevWeek.isLastConsecutiveWeek = false;
		return prevWeek.consecutivePrevWeeks + 1;
	}

	return 0;
}

function updateMaxTotalEstHoursForProject(
	processedDataMap: ProjectDataMapType,
	projectIdString: string
) {
	let maxTotalEstHours = 40;
	const projectId = parseInt(projectIdString);

	_.forOwn(
		processedDataMap[projectId],
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
		processedDataMap[projectId],
		(
			yearData: { [cweek: number]: WorkWeekBlockMemberType[] },
			year: string
		) => {
			_.forOwn(
				yearData,
				(workWeekBlocks: WorkWeekBlockMemberType[], cweek: string) => {
					if (workWeekBlocks) {
						workWeekBlocks.forEach((workWeekBlock) => {
							workWeekBlock.maxTotalEstHours = maxTotalEstHours;
						});
					}
				}
			);
		}
	);
}

export function getWorkWeeksForProjectByWeekAndYear(
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
									className="absolute text-bottom text-black text-xs text-wrap"
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
			fill="#72DDC3"
		/>
	);
};

export const divideNumberByCommas = (number: number | string) => {
  const valueToDivide = Number(number);

  return valueToDivide.toLocaleString("en-US");
};

export const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>, invalidChars: string[]) => invalidChars.includes(e.key) && e.preventDefault();

export const sortSingleProjectByOrder = (
  sortOrder: SORT_ORDER,
  assignments: AssignmentType[]
) => {
  const arrayToSort = assignments?.length ? [...assignments] : [];
  if (sortOrder === SORT_ORDER.ASC) {
    return arrayToSort.sort((a, b) => {
      const userA = a.assignedUser ? a.assignedUser.name.toLowerCase() : "";
      const userB = b.assignedUser ? b.assignedUser.name.toLowerCase() : "";
      if (userA < userB) {
        return -1;
      }
      if (userA > userB) {
        return 1;
      }
      return 0;
    });
  }
  if (sortOrder === SORT_ORDER.DESC) {
    return arrayToSort.sort((a, b) => {
      const userA = a.assignedUser ? a.assignedUser.name.toLowerCase() : "";
      const userB = b.assignedUser ? b.assignedUser.name.toLowerCase() : "";
      if (userA < userB) {
        return 1;
      }
      if (userA > userB) {
        return -1;
      }
      return 0;
    });
  }
  return assignments;
};

export const sortSingleProject = (sortMethod: string, assignments: AssignmentType[]) => {
	const arrayToSort = assignments?.length ? [...assignments] : [];
	if (sortMethod === "abcUserName") {
		return arrayToSort.sort((a, b) => {
			const userA = a.assignedUser ? a.assignedUser.name.toLowerCase() : "";
			const userB = b.assignedUser ? b.assignedUser.name.toLowerCase() : "";
			if (userA < userB) {
				return -1;
			}
			if (userA > userB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "startDate") {
		return arrayToSort.sort((a, b) => {
			const userA =
				a.startsOn
					? a.startsOn
					: "";
			const userB =
				b.startsOn
					? b.startsOn
					: "";
			if (userA < userB) {
				return -1;
			}
			if (userA > userB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "status") {
		return arrayToSort.sort((a, b) => {
			const userA =
				a.status ? a.status : "";
			const userB =
				b.status ? b.status : "";
			if (userA < userB) {
				return -1;
			}
			if (userA > userB) {
				return 1;
			}
			return 0;
		});
	}
	return assignments;
};

export const sortProjectListByOrder = (
  sortOrder: SORT_ORDER,
  sortBy: string,
  projectList: ProjectType[]
) => {
  const arrayToSort = [...projectList];

  if (sortBy === "Projects" && sortOrder === SORT_ORDER.ASC) {
    return arrayToSort.sort((a, b) => {
      const projectA = a.name.toLowerCase();
      const projectB = b.name.toLowerCase();
      if (projectA < projectB) {
        return -1;
      }
      if (projectA > projectB) {
        return 1;
      }
      return 0;
    });
  }
  if (sortBy === "Projects" && sortOrder === SORT_ORDER.DESC) {
    return arrayToSort.sort((a, b) => {
      const projectA = a.name.toLowerCase();
      const projectB = b.name.toLowerCase();
      if (projectA < projectB) {
        return 1;
      }
      if (projectA > projectB) {
        return -1;
      }
      return 0;
    });
  }

  if (sortBy === "Clients" && sortOrder === SORT_ORDER.ASC) {
    return arrayToSort.sort((a, b) => {
      const projectA = a.client.name.toLowerCase();
      const projectB = b.client.name.toLowerCase();
      if (projectA < projectB) {
        return -1;
      }
      if (projectA > projectB) {
        return 1;
      }
      return 0;
    });
  }
  if (sortBy === "Clients" && sortOrder === SORT_ORDER.DESC) {
    return arrayToSort.sort((a, b) => {
      const projectA = a.client.name.toLowerCase();
      const projectB = b.client.name.toLowerCase();
      if (projectA < projectB) {
        return 1;
      }
      if (projectA > projectB) {
        return -1;
      }
      return 0;
    });
  }
};

export const sortProjectList = (
	sortMethod: string,
	projectList: ProjectType[]
) => {
	const arrayToSort = [...projectList];
	if (sortMethod === "abcProjectName") {
    	return arrayToSort.sort((a, b) => {
      const projectA = a.name.toLowerCase();
      const projectB = b.name.toLowerCase();
      if (projectA < projectB) {
        return -1;
      }
      if (projectA > projectB) {
        return 1;
      }
      return 0;
    });
  }
	if (sortMethod === "status") {
		return arrayToSort.sort((a, b) => {
			const projectA = a.status.toLowerCase();
			const projectB = b.status.toLowerCase();
			if (projectA < projectB) {
				return -1;
			}
			if (projectA > projectB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "startDate") {
		return arrayToSort.sort((a, b) => {
			const projectA = a.startsOn;
			const projectB = b.startsOn;
			if (projectA && projectB) {
				if (projectA < projectB) {
					return -1;
				}
				if (projectA > projectB) {
					return 1;
				}
			}
			return 0;
		});
	}
	if (sortMethod === "staffingNeeds") {
		return arrayToSort.sort((a, b) => {
			const assignmentCountA = a.assignments?.map(
				(assignment: AssignmentType) => assignment
			).length;
			const assignmentCountB = b.assignments?.map(
				(assignment: AssignmentType) => assignment
			).length;
			const projectA = a.fte - (assignmentCountA ?? 0);
			const projectB = b.fte - (assignmentCountB ?? 0);
			if (projectA < projectB) {
				return 1;
			}
			if (projectA > projectB) {
				return -1;
			}
			return 0;
		});
	}
};

export const sortSingleUserByOrder = (
  sortOrder: SORT_ORDER,
  sortBy: string,
  user: UserType
) => {
  const arrayToSort = user.assignments?.length ? [...user.assignments] : [];
  const sortedAssignments = { ...user, assignments: arrayToSort };

  if (sortBy === "Projects" && sortOrder === SORT_ORDER.ASC) {
    sortedAssignments.assignments.sort((a, b) => {
      const projectA = a.project.name.toLowerCase();
      const projectB = b.project.name.toLowerCase();
      return projectA.localeCompare(projectB);
    });
  }
  if (sortBy === "Projects" && sortOrder === SORT_ORDER.DESC) {
    sortedAssignments.assignments.sort((a, b) => {
      const projectA = a.project.name.toLowerCase();
      const projectB = b.project.name.toLowerCase();
      return projectB.localeCompare(projectA);
    });
  }

  if (sortBy === "Client" && sortOrder === SORT_ORDER.ASC) {
    sortedAssignments.assignments.sort((a, b) => {
      const clientA = a.project.client.name.toLowerCase();
			const clientB = b.project.client.name.toLowerCase();
			
      if (clientA !== clientB) {
        return clientA.localeCompare(clientB);
			}
			
      const projectA = a.project.name.toLowerCase();
      const projectB = b.project.name.toLowerCase();
      return projectA.localeCompare(projectB);
    });
  }
  if (sortBy === "Client" && sortOrder === SORT_ORDER.DESC) {
    sortedAssignments.assignments.sort((a, b) => {
      const clientA = a.project.client.name.toLowerCase();
			const clientB = b.project.client.name.toLowerCase();
			
      if (clientA !== clientB) {
        return clientB.localeCompare(clientA);
      }

      const projectA = a.project.name.toLowerCase();
      const projectB = b.project.name.toLowerCase();
      return projectA.localeCompare(projectB);
    });
  }

  return sortedAssignments;
};

export const sortSingleUser = (sortMethod: string, user: UserType) => {
	const arrayToSort = user.assignments?.length ? [...user.assignments] : [];
	const sortedAssignments = { ...user, assignments: arrayToSort };
	if (sortMethod === "abcProjectName") {
		sortedAssignments.assignments.sort((a, b) => {
			const projectA = a.project.name.toLowerCase();
			const projectB = b.project.name.toLowerCase();
			if (projectA < projectB) {
				return -1;
			}
			if (projectA > projectB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "byClient") {
		sortedAssignments.assignments.sort((a, b) => {
			const clientA = a.project.client.name.toLowerCase();
			const clientB = b.project.client.name.toLowerCase();
			if (clientA < clientB) {
				return -1;
			}
			if (clientA > clientB) {
				return 1;
			}
			return 0;
		});

	}
	if (sortMethod === "startDate") {
		sortedAssignments.assignments.sort((a, b) => {
			const projectA = a.startsOn;
			const projectB = b.startsOn;
			if (projectA && projectB) {
				if (projectA < projectB) {
					return -1;
				}
				if (projectA > projectB) {
					return 1;
				}
			}
			return 0;
		});
	}
	return sortedAssignments;
};

export const sortUserListByOrder = (
  sortOrder: SORT_ORDER,
  userList: UserType[]
) => {
  const arrayToSort = [...userList];
  if (sortOrder === SORT_ORDER.ASC) {
    return arrayToSort.sort((a, b) => {
      const userA = a.name.toLowerCase();
      const userB = b.name.toLowerCase();
      if (userA < userB) {
        return -1;
      }
      if (userA > userB) {
        return 1;
      }
      return 0;
    });
  }

  if (sortOrder === SORT_ORDER.DESC) {
    return arrayToSort.sort((a, b) => {
      const userA = a.name.toLowerCase();
      const userB = b.name.toLowerCase();
      if (userA < userB) {
        return 1;
      }
      if (userA > userB) {
        return -1;
      }
      return 0;
    });
  }
  return userList;
};

export const sortUserList = (sortMethod: string, userList: UserType[]) => {
	const arrayToSort = [...userList];
	if (sortMethod === "abcUserName") {
		return arrayToSort.sort((a, b) => {
			const userA = a.name.toLowerCase();
			const userB = b.name.toLowerCase();
			if (userA < userB) {
				return -1;
			}
			if (userA > userB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "userAvailability") {
		const today = DateTime.now();
		const ninetyDaysFromNow = today.plus({
			days: 90,
		});
		const timePeriod = Interval.fromDateTimes(today, ninetyDaysFromNow);
		return arrayToSort.sort((a, b) => {
			//if a user has no assignments we have an empty array
			const userA = a.assignments || [];
			const userB = b.assignments || [];
			//we reduce each users assignments into total hours assigned that fall within a 90 day period
			const totalAssignedHoursUserA = userA.reduce((acc, curr) => {
				if (curr.startsOn) {
					const currStartsOn = DateTime.fromISO(curr.startsOn);
					const isWithinTimePeriod = timePeriod.contains(currStartsOn);
					if (isWithinTimePeriod) {
						const weeksBetweenNinety = ninetyDaysFromNow.diff(
							currStartsOn,
							"weeks"
						).weeks;
						//if the assignment has an end date we calculate the weeks between the start and end date as long as the end date is within the 90 day period
						if (curr.endsOn) {
							const currEndsOn = DateTime.fromISO(curr.endsOn);
							const weeksBetweenEndsOn = currEndsOn.diff(
								currStartsOn,
								"weeks"
							).weeks;
							//if the end date is after 90 days we calculate the weeks between the start date and 90 days from now
							if (currEndsOn > ninetyDaysFromNow) {
								return (
									acc + (curr.estimatedWeeklyHours * weeksBetweenNinety || 0)
								);
							}
							return (
								acc + (curr.estimatedWeeklyHours * weeksBetweenEndsOn || 0)
							);
						}
						//if the assignment has no end date we assume it's perpetual and just multiply by weeks til 90 days from now
						return acc + (curr.estimatedWeeklyHours * weeksBetweenNinety || 0);
					}
				}
				return acc;
			}, 0);
			const totalAssignedHoursUserB = userB.reduce((acc, curr) => {
				if (curr.startsOn) {
					const currStartsOn = DateTime.fromISO(curr.startsOn);
					const isWithinTimePeriod = timePeriod.contains(currStartsOn);
					if (isWithinTimePeriod) {
						const weeksBetweenNinety = ninetyDaysFromNow.diff(
							currStartsOn,
							"weeks"
						).weeks;
						if (curr.endsOn) {
							const currEndsOn = DateTime.fromISO(curr.endsOn);
							const weeksBetweenEndsOn = currEndsOn.diff(
								currStartsOn,
								"weeks"
							).weeks;
							if (currEndsOn > ninetyDaysFromNow) {
								return (
									acc + (curr.estimatedWeeklyHours * weeksBetweenNinety || 0)
								);
							}
							return (
								acc + (curr.estimatedWeeklyHours * weeksBetweenEndsOn || 0)
							);
						}
						return acc + (curr.estimatedWeeklyHours * weeksBetweenNinety || 0);
					}
				}
				return acc;
			}, 0);
			const hoursA = totalAssignedHoursUserA || 0;
			const hoursB = totalAssignedHoursUserB || 0;
			if (hoursA < hoursB) {
				return -1;
			}
			if (hoursA > hoursB) {
				return 1;
			}
			return 0;
		});
	}
	if (sortMethod === "unconfirmedPlans") {
		//sort what users have the most assignments that are "proposed" greatest to least
		return arrayToSort.sort((a, b) => {
			const userA = a.assignments || [];
			const userB = b.assignments || [];
			const unconfirmedPlansA = userA.filter(
				(assignment) => assignment.status === "proposed"
			);
			const unconfirmedPlansB = userB.filter(
				(assignment) => assignment.status === "proposed"
			);
			if (unconfirmedPlansA.length < unconfirmedPlansB.length) {
				return 1;
			}
			if (unconfirmedPlansA.length > unconfirmedPlansB.length) {
				return -1;
			}
			return 0;
		});
	}
	return userList;
};

export const convertProjectToCSV = (data: ProjectType): string => {
	const assignments = data.assignments || []
	const sortedWorkWeeks = sortWeeklyHoursByDate(calculateWeeklyHoursForCSV(assignments))
	const { totalEstimatedHoursPerProject, totalActualHoursPerProject } = calculateWeeklyHoursPerProjectForCSV(sortedWorkWeeks)
	const deltaHours = (totalActualHoursPerProject - totalEstimatedHoursPerProject);
	const headers = [
		'Project Name',
		'Starts date',
		'Ends date',
		'Work week',
		'Actual Hours',
		'Planned Hours',
		'Total Hours'
	].join(';');

	const projectRows = sortedWorkWeeks.map((week, index) => [
		index === 0 ? data.name : '',
		index === 0 ? data.startsOn || '' : '',
		index === 0 ? data.endsOn || '' : '',
		weekNumberToDateRange(week.week, week.year),
		week.totalActualHours || '0',
		week.totalEstimatedHours || '0'
	].join(';')).join('\n');

	const summaryRows = [
		`Burned;;;;;;${totalActualHoursPerProject}`,
		`Planned;;;;;;${totalEstimatedHoursPerProject}`,
		`Delta;;;;;;${deltaHours}`,
		`Targeted;;;;;;${data.hours || ''}`
	].join('\n');

	const usersByMonth = groupAndSumWeeksByMonthForUsers(assignments);

	const userRows = usersByMonth.map(user => {
		const userMonths = user.months.map(month => `${month.monthLabel}`);

		const userNameRow = `${user.userName};${userMonths.join(';')}`;

		const burnedHoursRow = `Burned Hours;${user.months.map(month => `${month.totalActualHours || 0}`).join(';')}`;

		const estimatedHoursRow = `Planned Hours;${user.months.map(month => `${month.totalEstimatedHours || 0}`).join(';')}`;

		return `${userNameRow}\n${burnedHoursRow}\n${estimatedHoursRow}`;
	}).join('\n\n');

	return `${headers}\n${projectRows}\n${summaryRows}\n\n${userRows}`;
};

export const mergeClasses = (...classes: ClassValue[]): string => {
	return classes
		.flatMap((cls) => {
			if (typeof cls === 'string' || typeof cls === 'undefined') {
				return cls;
			} else if (typeof cls === 'object' && cls !== null) {
				return Object.entries(cls)
					.filter(([, condition]) => condition)
					.map(([className]) => className);
			}
			return [];
		})
		.filter(Boolean)
		.join(' ');
};