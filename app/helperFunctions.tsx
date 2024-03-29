import {
	ProjectDataMapType,
	UserAssignmentDataMapType,
	WorkWeekBlockMemberType,
} from "./typeInterfaces";

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


export function matchWorkWeekBlocks(prevBlocks: WorkWeekBlockMemberType[], currentBlocks: WorkWeekBlockMemberType[]): WorkWeekBlockMemberType[] {
	const matchedBlocks: WorkWeekBlockMemberType[] = [];
	const usedIndices: boolean[] = new Array(currentBlocks.length).fill(false);

	// Match blocks based on the project name in reverse order
	for (let i = prevBlocks.length - 1; i >= 0; i--) {
		const prevBlock = prevBlocks[i];
		const currentIndex = currentBlocks.findIndex(
			(block, index) => block.workWeek.project?.name === prevBlock.workWeek.project?.name && !usedIndices[index]
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

export function processUserAssignmentDataMap(userList: any): UserAssignmentDataMapType {
	const processedDataMap: UserAssignmentDataMapType = {};
	userList.forEach((user: any) => {
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
						processedDataMap[userId][workWeek.year][workWeek.cweek] = [];
					}

					let consecutivePrevWeeks = 0;
					// Check if the previous week is consecutive and update the consecutivePrevWeeks count
					const prevWeek = processedDataMap[userId][workWeek.year][workWeek.cweek - 1]?.find(
						(block: WorkWeekBlockMemberType) => block.workWeek.project && block.workWeek.project.name === assignment.project.name
					);
					if (prevWeek) {
						consecutivePrevWeeks = prevWeek.consecutivePrevWeeks + 1;
						prevWeek.isLastConsecutiveWeek = false;
					}

					// Get the previous week's work week blocks in reverse order
					const prevWeekBlocks = [...(processedDataMap[userId][workWeek.year][workWeek.cweek - 1] || [])].reverse();

					// Get the current week's work week blocks
					const currentWeekBlocks = [...processedDataMap[userId][workWeek.year][workWeek.cweek]];

					const currentWorkWeekBlock = {
						workWeek: workWeek,
						consecutivePrevWeeks: consecutivePrevWeeks,
						isLastConsecutiveWeek: true,
						itemEstHoursOffset: 0,
						maxTotalEstHours: 40,
					};

					currentWeekBlocks.push(currentWorkWeekBlock);

					// Find the best matching order for the current week's blocks
					const bestMatchingOrder = matchWorkWeekBlocks(prevWeekBlocks, currentWeekBlocks);

					// Update the current week's blocks with the best matching order
					processedDataMap[userId][workWeek.year][workWeek.cweek] = bestMatchingOrder;
				});
			}
		});

		// Iterate through each given week and year to get projects for a given time, then calculate total est hours
		Object.keys(processedDataMap[userId]).forEach((year: string) => {
			const yearAsNumber = parseInt(year);
			Object.keys(processedDataMap[userId][yearAsNumber]).forEach((cweek) => {
				const cweekAsNumber = parseInt(cweek);
				const workWeekBlocks = processedDataMap[userId][yearAsNumber][cweekAsNumber];
				let totalEstHours = 0;

				// Calculate the total estimated hours for the week
				workWeekBlocks.forEach((workWeekBlock) => {
					totalEstHours += workWeekBlock.workWeek.estimatedHours || 0;
				});

				// If the total estimated hours for the week is greater than 40, update the maxTotalEstHours
				if (totalEstHours > 40) {
					maxTotalEstHours = totalEstHours;
				}
			});
		});

		// Update the maxTotalEstHours for each project under the user
		Object.keys(processedDataMap[userId]).forEach((year: string) => {
			const yearAsNumber = parseInt(year);
			Object.keys(processedDataMap[userId][yearAsNumber]).forEach((cweek) => {
				const cweekAsNumber = parseInt(cweek);
				const workWeekBlocks = processedDataMap[userId][yearAsNumber][cweekAsNumber];

				// Update the maxTotalEstHours for each project
				workWeekBlocks.forEach((workWeekBlock) => {
					workWeekBlock.maxTotalEstHours = maxTotalEstHours;
				});
			});
		});
	});


	return processedDataMap;
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
	  let maxTotalEstHours = 40;
  
	  project.workWeeks.forEach((workWeek: any) => {
		if (!processedDataMap[projectId][workWeek.year]) {
		  processedDataMap[projectId][workWeek.year] = {};
		}
		if (!processedDataMap[projectId][workWeek.year][workWeek.cweek]) {
		  processedDataMap[projectId][workWeek.year][workWeek.cweek] = [];
		}
  
		let consecutivePrevWeeks = 0;
		// Check if the previous week is consecutive and update the consecutivePrevWeeks count
		const prevWeek = processedDataMap[projectId][workWeek.year][workWeek.cweek - 1]?.find(
		  (block: WorkWeekBlockMemberType) => block.workWeek.user && block.workWeek.user.name === workWeek.user.name
		);
		if (prevWeek) {
		  consecutivePrevWeeks = prevWeek.consecutivePrevWeeks + 1;
		  prevWeek.isLastConsecutiveWeek = false;
		}
  
		// Get the previous week's work week blocks in reverse order
		const prevWeekBlocks = [...(processedDataMap[projectId][workWeek.year][workWeek.cweek - 1] || [])].reverse();
  
		// Get the current week's work week blocks
		const currentWeekBlocks = [...processedDataMap[projectId][workWeek.year][workWeek.cweek]];
  
		const currentWorkWeekBlock = {
		  workWeek: workWeek,
		  consecutivePrevWeeks: consecutivePrevWeeks,
		  isLastConsecutiveWeek: true,
		  itemEstHoursOffset: 0,
		  maxTotalEstHours: 40,
		};
  
		currentWeekBlocks.push(currentWorkWeekBlock);
  
		// Find the best matching order for the current week's blocks
		const bestMatchingOrder = matchWorkWeekBlocks(prevWeekBlocks, currentWeekBlocks);
  
		// Update the current week's blocks with the best matching order
		processedDataMap[projectId][workWeek.year][workWeek.cweek] = bestMatchingOrder;
	  });
  
	  // Iterate through each given week and year to get users for a given time, then calculate total est hours
	  Object.keys(processedDataMap[projectId]).forEach((year: string) => {
		const yearAsNumber = parseInt(year);
		Object.keys(processedDataMap[projectId][yearAsNumber]).forEach((cweek) => {
		  const cweekAsNumber = parseInt(cweek);
		  const workWeekBlocks = processedDataMap[projectId][yearAsNumber][cweekAsNumber];
		  let totalEstHours = 0;
  
		  // Calculate the total estimated hours for the week
		  workWeekBlocks.forEach((workWeekBlock) => {
			totalEstHours += workWeekBlock.workWeek.estimatedHours || 0;
		  });
  
		  // If the total estimated hours for the week is greater than 40, update the maxTotalEstHours
		  if (totalEstHours > 40) {
			maxTotalEstHours = totalEstHours;
		  }
		});
	  });
  
	  // Update the maxTotalEstHours for each user under the project
	  Object.keys(processedDataMap[projectId]).forEach((year: string) => {
		const yearAsNumber = parseInt(year);
		Object.keys(processedDataMap[projectId][yearAsNumber]).forEach((cweek) => {
		  const cweekAsNumber = parseInt(cweek);
		  const workWeekBlocks = processedDataMap[projectId][yearAsNumber][cweekAsNumber];
  
		  // Update the maxTotalEstHours for each user
		  workWeekBlocks.forEach((workWeekBlock) => {
			workWeekBlock.maxTotalEstHours = maxTotalEstHours;
		  });
		});
	  });
	});
  
	return processedDataMap;
  }
  
  export function getWorkWeeksForProjectByWeekAndYearForProjects(
	projectDataMap: ProjectDataMapType,
	projectId: number,
	cweek: number,
	year: number
  ): WorkWeekBlockMemberType[] {
	if (projectDataMap[projectId] && projectDataMap[projectId][year] && projectDataMap[projectId][year][cweek]) {
	  return projectDataMap[projectId][year][cweek];
	}
  
	return [];
  }

export const drawBars = (workWeekBlocks: WorkWeekBlockMemberType[], width?: number, height?: number, gap: number = 4, cornerRadius = 6) => {
	if (!width || !height) { return; }

	return (
		<div className="absolute bottom-0 z-10">
			{workWeekBlocks.map((workWeekBlock: WorkWeekBlockMemberType, index: number) => {
				if (workWeekBlock.workWeek.estimatedHours && width && height) {
					const weekHeight = (height * workWeekBlock.workWeek.estimatedHours / workWeekBlock.maxTotalEstHours);
					return (
						<div key={index}>
							<svg width={width + 1} height={weekHeight} xmlns="http://www.w3.org/2000/svg">
								{drawBar(workWeekBlock.consecutivePrevWeeks != 0 ? 0 : gap, (index * gap), cornerRadius, weekHeight, weekHeight, width + 1, workWeekBlock.consecutivePrevWeeks != 0, !workWeekBlock.isLastConsecutiveWeek)}
							</svg>
						</div>

					)
				}

			})}
		</div>

	);
}

export const drawFTELabels = (workWeekBlocks: WorkWeekBlockMemberType[], width?: number, height?: number, gap: number = 4) => {
	if (!width || !height) {
		return;
	}

	const labelPadding = 4;

	return (
		<div className="absolute bottom-0 z-30">
			{workWeekBlocks.map((workWeekBlock: WorkWeekBlockMemberType, index: number) => {
				if (workWeekBlock.workWeek.estimatedHours && width && height) {
					const weekHeight = (height * workWeekBlock.workWeek.estimatedHours / workWeekBlock.maxTotalEstHours);

					// Check if the previous week has the same project
					const hasSameProject = workWeekBlock.consecutivePrevWeeks != 0

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
								{hasSameProject ? "" : (workWeekBlock.workWeek.project && workWeekBlock.workWeek.project.name ? workWeekBlock.workWeek.project.name : workWeekBlock.workWeek.user && workWeekBlock.workWeek.user.name ? workWeekBlock.workWeek.user.name : "")}
							</div>
						</div>
					);
				}
			})}
		</div>
	);
};

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