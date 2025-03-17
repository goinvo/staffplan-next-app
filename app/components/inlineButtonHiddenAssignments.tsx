"use client";
import React, { useEffect, useState } from "react";

import { useParams, usePathname } from "next/navigation";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { useGeneralDataContext } from "../contexts/generalContext";
import { useUserDataContext } from "../contexts/userDataContext";
import {
	calculateTotalHoursPerWeek,
	currentWeek,
	currentYear,
	getWeeksPerScreen,
	isBeforeWeek,
} from "@/app/components/scrollingCalendar/helpers";
import DraggableDates from "@/app/components/projectAssignment/draggableProjectDates";
import ColumnChart from "@/app/components/columnChart";
import { AssignmentType, MonthsDataType, UserType } from "@/app/typeInterfaces";
import useDynamicWeeks from "@/app/hooks/useDynamicWeeks";

const InlineButtonHiddenAssignments: React.FC = () => {
	const params = useParams();
	const pathname = usePathname();

	const [months, setMonths] = useState<MonthsDataType[]>([]);
	const { dateRange, setDateRange } = useGeneralDataContext();
	const { userList, singleUserPage, setSelectedUserData } =
		useUserDataContext();
	const {
		viewer,
		showArchivedAssignments,
		showHiddenAssignments,
		setShowHiddenAssignments,
	} = useGeneralDataContext();

	const weeksCount = useDynamicWeeks({
		baseWidth: 600,
		baseWeeksCount: 1,
		pixelsPerWeek: 42,
		isMobileCheck: true,
		minWeeks: 5,
	});

	const assignments =
		userList
			.find((user) => user.id?.toString() === viewer?.id.toString())
			?.assignments.filter((a) => !a.focused) || [];

	useEffect(() => {
		const monthData = getWeeksPerScreen(dateRange, weeksCount);
		setMonths(monthData);
	}, [dateRange, weeksCount]);

	const {
		totalActualHours,
		totalEstimatedHours,
		proposedEstimatedHours,
		maxTotalHours,
	} = calculateTotalHoursPerWeek(assignments as AssignmentType[], months);

	const userId = decodeURIComponent(params?.userId?.toString() || "");

	const focusedAssignments =
		viewer?.id.toString() === userId
			? userList
					.find((user) => user.id?.toString() === viewer?.id.toString())
					?.assignments.filter((a) => !a.focused) || []
			: [];

	const isStaffPlanPage =
		pathname.includes("people") && pathname.split("/").length === 3;

	const label = showHiddenAssignments
		? `Ok, only show projects i'm interested in`
		: `Show ${focusedAssignments.length} hidden ${
				focusedAssignments.length > 1 ? "projects" : "project"
		  }`;

	console.log(totalActualHours, "total actuals");
	return (
		<>
			{focusedAssignments.length > 0 ? (
				<>
					<tr className="flex sm:justify-normal justify-between bg-white-300 hover:bg-hoverGrey pt-2 pr-3 border-t border-gray-300">
						<td
							className={`pl-3 sm:px-0 py-1 sm:pt-1 sm:pb-2 font-normal align-top w-1/2 sm:w-2/5`}
						>
							<button
								onClick={() => setShowHiddenAssignments(!showHiddenAssignments)}
								className="cursor-pointer"
							>
								{label}
							</button>
						</td>
						{!showHiddenAssignments && (
							<div
								className={`text-contrastBlue sm:flex hidden pr-2 sm:pr-1 md:pr-2 flex-col items-end  max-w-[50px] w-full
              }`}
							>
								<div className="pt-1">Planned</div>
							</div>
						)}
						{!showHiddenAssignments &&
							months?.map((month) => {
								return month.weeks.map((week) => {
									const isCurrentWeek =
										currentWeek === week.weekNumberOfTheYear &&
										currentYear === month.year;
									return (
										<td
											key={`month-${month.monthLabel}-week-${week.weekNumberOfTheYear}`}
											className={`sm:block hidden relative px-1 
								${isCurrentWeek ? "bg-selectedColumnBg font-bold" : "font-normal"}`}
										>
											<div className="sm:w-[34px] w-[68px]">
												<div className="absolute bottom-0 left-0 right-0 sm:max-w-[34px] max-w-[68px] px-1 sm:pb-2 ">
													<span
														className={`flex justify-center text-center text-gray-500 sm:w-[34px] w-[68px]`}
													>
														{
															totalEstimatedHours[
																`${month.year}-${week.weekNumberOfTheYear}`
															]
														}
													</span>
												</div>
											</div>
										</td>
									);
								});
							})}
						<td className="font-normal py-2 sm:pl-4 pl-0 pr-0 ml-1 sm:ml-0 w-1/2 sm:w-1/6"></td>
					</tr>
					<tr className="flex sm:justify-normal justify-between bg-white-300 hover:bg-hoverGrey pr-3 border-gray-300">
						<td
							className={`pl-3 sm:px-0 py-1 sm:pt-1 sm:pb-2 font-normal align-top w-1/2 sm:w-2/5`}
						>
							{!showHiddenAssignments && (
								<p>Total includes hours from hidden projects</p>
							)}
						</td>
						{!showHiddenAssignments && (
							<div
								className={`text-contrastBlue sm:flex hidden pr-2 sm:pr-1 md:pr-2 flex-col items-end  max-w-[50px] w-full
              }`}
							>
								<div className="pt-1">Actual</div>
							</div>
						)}
						{!showHiddenAssignments &&
							months?.map((month) => {
								return month.weeks.map((week) => {
									const isCurrentWeek =
										currentWeek === week.weekNumberOfTheYear &&
										currentYear === month.year;
									return (
										<td
											key={`month-${month.monthLabel}-week-${week.weekNumberOfTheYear}`}
											className={`sm:block hidden relative px-1 
                  ${
										isCurrentWeek
											? "bg-selectedColumnBg font-bold"
											: "font-normal"
									}`}
										>
											<div className="sm:w-[34px] w-[68px]">
												<div className="absolute bottom-0 left-0 right-0 sm:max-w-[34px] max-w-[68px] px-1 sm:pb-2 ">
													<span
														className={`flex justify-center text-center text-gray-500 sm:w-[34px] w-[68px]`}
													>
														{
															totalActualHours[
																`${month.year}-${week.weekNumberOfTheYear}`
															]
														}
													</span>
												</div>
											</div>
										</td>
									);
								});
							})}
						<td className="font-normal py-2 sm:pl-4 pl-0 pr-0 ml-1 sm:ml-0 w-1/2 sm:w-1/6"></td>
					</tr>
				</>
			) : (
				<></>
			)}
		</>
	);
};

export default InlineButtonHiddenAssignments;
