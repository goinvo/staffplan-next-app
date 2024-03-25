"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import withApollo from "@/lib/withApollo";
import { useUserDataContext } from "../userDataContext";
import { UserType, UserAssignmentDataMapType, WorkWeekBlockMemberType } from "../typeInterfaces";
import { processUserAssignmentDataMap, getWorkWeeksForUserByWeekAndYear, drawBar } from "../helperFunctions";
import WeekDisplay from "../components/weekDisplay";
import { SVGAlphabet } from "../svgAlphabet";
import { LoadingSpinner } from "../components/loadingSpinner";

const PeopleView: React.FC = () => {
	const [userAssignmentDataMap, setUserAssignmentDataMap] = useState<UserAssignmentDataMapType>({});
	const [rowIdtoUserIdMap, setRowIdtoUserIdMap] = useState<Map<number, number>>(new Map());
	const router = useRouter();
	const pathname = usePathname();

	const { userList } = useUserDataContext();

	useEffect(() => {
		if (userList) {
			// Setup the map of users to their assignments' work weeks
			setUserAssignmentDataMap(processUserAssignmentDataMap(userList));

			// Setup the map of row ids to user ids
			userList?.map((user: UserType, index: number) => {
				if (user.id && !rowIdtoUserIdMap.has(index)) {
					rowIdtoUserIdMap.set(index, user.id);
				}
			});
		}
	}, [userList]);

	const handleUserChange = (user: UserType) => {
		router.push(pathname + "/" + encodeURIComponent(user.name.toString()));
	};


	const drawBars = (workWeekBlocks: WorkWeekBlockMemberType[], width?: number, height?: number, gap: number = 4, cornerRadius = 6) => {
		if (!width || !height) { return; }
if(!userList) return <LoadingSpinner/>
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

	const drawFTELabels = (workWeekBlocks: WorkWeekBlockMemberType[], width?: number, height?: number, gap: number = 4) => {
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
					  {hasSameProject ? "" : (workWeekBlock.workWeek.project && workWeekBlock.workWeek.project.name ? workWeekBlock.workWeek.project.name : "")}
					</div>
				  </div>
				);
			  }
			})}
		  </div>
		);
	  };




	const renderCell = (cweek: number, year: number, rowIndex: number, isSelected: boolean, width?: number, height?: number) => {
		const userId = rowIdtoUserIdMap.get(rowIndex);

		if (userId) {
			const workWeeksForUser = getWorkWeeksForUserByWeekAndYear(userAssignmentDataMap, userId, cweek, year) ?? [];
			
			if (workWeeksForUser.length > 0) {
				return (
					<div className="relative absolute" style={{ height: height }}>
						{drawBars(workWeeksForUser, width, height)}
						{drawFTELabels(workWeeksForUser, width, height)}
					</div>
				)
			}
		}


		return (<></>)

	}

	return (
		<>
			<WeekDisplay labelContents={
				userList?.map((user: UserType) => (
					<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={user.id}>
						<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleUserChange(user)}><SVGAlphabet name={user.name}/></div>
						<div className="flex">{user.name}</div>
					</div>
				))}
				renderCell={renderCell}
			/>
		</>
	);
};

export default withApollo(PeopleView);
