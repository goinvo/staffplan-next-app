"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { SlPencil } from "react-icons/sl";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";

import ColumnChart from "../columnChart";
import IconButton from "../iconButton";

import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import {
	AssignmentType,
	MonthsDataType,
	ProjectSummaryInfoItem,
	ProjectType,
} from "@/app/typeInterfaces";
import {
	calculateTotalHoursPerWeek,
	isBeforeWeek,
	showMonthAndYear,
	getNextWeeksPerView,
	getPrevWeeksPerView,
	currentWeek,
	currentYear,
	getStartAndEndDatesOfWeek,
	isTodayInRange,
} from "./helpers";
import ViewsMenu from "../viewsMenu/viewsMenu";
import EditFormController from "./editFormController";
import DraggableDates from "../projectAssignment/draggableProjectDates";
import { SORT_ORDER } from "./constants";

interface ColumnHeaderTitle {
	title: string;
	showIcon: boolean;
	onIconClick?: () => void;
	onClick?: () => void;
}

type CalendarHeaderProps = {
	assignments: AssignmentType[] | AssignmentType | ProjectType[] | ProjectType;
	months: MonthsDataType[];
	avatarUrl?: string;
	title?: string;
	userName?: string;
	editable?: boolean;
	projectInfo?: string;
	columnHeaderTitles: ColumnHeaderTitle[];
	draggableDates?: boolean;
	projectSummaryInfo?: ProjectSummaryInfoItem[];
	initialSorting: { title: string; sort: SORT_ORDER };
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
	assignments,
	months,
	avatarUrl,
	title,
	userName,
	editable = false,
	projectInfo,
	columnHeaderTitles,
	draggableDates = false,
	projectSummaryInfo,
	initialSorting,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isTodayInView, setIsTodayInView] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
	const [sortedBy, setSortedBy] = useState(initialSorting);
	const { setDateRange, scrollToTodayFunction } = useGeneralDataContext();
	const { setSortOrder: setSortOrderForPeople, setSortBy: setSortByForPeople, sortUserList } =
		useUserDataContext();
	const {
		setSortOrder: setSortOrderForProjects,
		setSortBy: setSortByForProjects,
		setSortOrderSingleProject,
	} = useProjectsDataContext();
	const {
		totalActualHours,
		totalEstimatedHours,
		proposedEstimatedHours,
		maxTotalHours,
	} = calculateTotalHoursPerWeek(assignments as AssignmentType[], months);
	const pathname = usePathname();

	const isStaffPlanPage =
		pathname.includes("people") && pathname.split("/").length === 3;
	const isProjectPage =
		pathname.includes("projects") && pathname.split("/").length === 3;
	const isProjectsPage = pathname.includes("projects") && pathname.split("/").length === 2;
	const isPeoplePage = pathname.includes("people") && pathname.split("/").length === 2;

	useEffect(() => {
		setIsTodayInView(isTodayInRange(months));
	}, [months]);

	useEffect(() => {
		if (isStaffPlanPage) {
			setSortOrderForPeople(sortedBy.sort);
			setSortByForPeople(sortedBy.title);

			localStorage.setItem(
				"staffPlanPageSorting",
				JSON.stringify({
					title: sortedBy.title,
					sort: sortedBy.sort,
				})
			);
		}
		if (isProjectsPage) {
			setSortOrderForProjects(sortedBy.sort);
			setSortByForProjects(sortedBy.title);

			localStorage.setItem(
				"projectsPageSorting",
				JSON.stringify({
					title: sortedBy.title,
					sort: sortedBy.sort,
				})
			);
		}
		if (isPeoplePage) {
			setSortOrderForPeople(sortedBy.sort);
			sortUserList(sortedBy.sort);

			localStorage.setItem(
				"peoplePageSorting",
				JSON.stringify({
					title: "People",
					sort: sortedBy.sort,
				})
			);
		}
		if (isProjectPage) {
			setSortOrderSingleProject(sortedBy.sort);

			localStorage.setItem(
				"projectPageSorting",
				JSON.stringify({
					title: "People",
					sort: sortedBy.sort,
				})
			);
		}
	}, [sortedBy]);

	const nextWeek = () => {
		setDateRange(getNextWeeksPerView(months));
	};

	const prevWeek = () => {
		setDateRange(getPrevWeeksPerView(months));
	};

	const hasActualHoursForWeek = (year: number, week: number) => {
		return !!totalActualHours[`${year}-${week}`];
	};

	const handleSorting = (title: string) => {
		if (sortedBy.title !== title) {
			setSortedBy({ title, sort: SORT_ORDER.ASC });
		} else {
			if (sortedBy.sort === SORT_ORDER.ASC) {
				setSortedBy({ ...sortedBy, sort: SORT_ORDER.DESC });
			} else {
				setSortedBy({ ...sortedBy, sort: SORT_ORDER.ASC });
			}
		}
	};
	return (
		<thead className="relative">
			<tr className="pl-5 border-bottom bg-contrastBlue min-h-28 text-white sm:flex hidden">
				<th
					className={`flex w-1/2 sm:w-1/3 px-0 py-5 ${
						isEditing ? "lg:mr-0" : "lg:mr-1"
					}`}
				>
					{isEditing ? (
						<EditFormController onClose={() => setIsEditing(false)} />
					) : (
						<div className="flex text-white items-center">
							{avatarUrl && (
								<div className="px-2 py-2 relative overflow-hidden w-[92px] h-[67px] aspect-[92/67] mr-4">
									<Image
										src={decodeURIComponent(avatarUrl)}
										fill
										sizes="(max-width: 640px) 80px, (max-width: 768px) 92px, 92px"
										className="rounded-lg object-cover"
										alt="Avatar"
									/>
								</div>
							)}
							<div className="flex flex-col items-start">
								<div className="flex items-center">
									<div className="text-huge text-left overflow-wrap break-word leading-snug">
										{title || userName}
									</div>
									{editable && (
										<IconButton
											className="py-1 pl-4"
											iconSize="w-4 h-4"
											onClick={() => setIsEditing(true)}
											Icon={SlPencil}
										/>
									)}
								</div>
								{projectInfo && (
									<div className="text-left overflow-wrap break-word py-2 font-normal">
										{projectInfo}
									</div>
								)}
							</div>
						</div>
					)}
				</th>
				{months?.map((month) => {
					return month.weeks.map((week) => {
						const isCurrentWeek =
							currentWeek === week.weekNumberOfTheYear &&
							currentYear === month.year;
						return (
							<th
								key={`month-${month.monthLabel}-week-${week.weekNumberOfTheYear}`}
								className={`sm:block hidden relative px-1 ${
									isCurrentWeek ? "navbar font-bold" : "font-normal"
								}`}
							>
								{draggableDates && (
									<DraggableDates
										weekNumberOfTheYear={week.weekNumberOfTheYear}
										monthYear={month.year}
										monthLabel={month.monthLabel}
									/>
								)}
								<ColumnChart
									hasActualHoursForWeek={hasActualHoursForWeek(
										month.year,
										week.weekNumberOfTheYear
									)}
									height={
										hasActualHoursForWeek(month.year, week.weekNumberOfTheYear)
											? totalActualHours[
													`${month.year}-${week.weekNumberOfTheYear}`
											  ]
											: totalEstimatedHours[
													`${month.year}-${week.weekNumberOfTheYear}`
											  ]
									}
									proposedHours={
										proposedEstimatedHours[
											`${month.year}-${week.weekNumberOfTheYear}`
										]
									}
									maxValue={maxTotalHours}
									isBeforeWeek={isBeforeWeek(week.weekNumberOfTheYear, month)}
								/>
							</th>
						);
					});
				})}
				<th className="pr-4 pl-2 py-2 w-1/2 sm:w-1/6">
					{projectSummaryInfo?.length && (
						<div className="sm:flex hidden justify-center flex-col pl-8 max-w-fit pt-1 cursor-pointer"
                        onMouseLeave={() => showTooltip && setShowTooltip(false)}
                        onClick={() => setShowTooltip(!showTooltip)}>
							{projectSummaryInfo?.map((sum, index) =>
								sum.show ? (
									<div
										key={index}
										className={`flex relative justify-between space-x-0.5 font-normal ${
											sum.label === "Target" ? "border-b-2" : ""
										} ${sum.label === "Delta" ? "border-t-2" : ""}`}
									>
										<label
											className={`cursor-pointer pr-1 text-sm leading-[18px] whitespace-nowrap`}
										>
											{sum.label}
										</label>
										<span className="font-bold text-sm leading-[18px] mr-auto">
											{sum.value}
											<span className="font-normal text-sm leading-[18px] pl-1">
												hrs
											</span>
										</span>
                                        {sum.tooltip && showTooltip && (
									<div className="absolute bottom-full right-0 bg-gray-700 text-white text-xs rounded px-2 py-1 z-10 shadow-lg min-w-40">
										{sum.tooltip}
									</div>)}
									</div>
								) : null
							)}
						</div>
					)}
				</th>
			</tr>
			<tr className="flex sm:justify-normal justify-between border-b border-gray-300 pl-5">
				<th className="px-0 pt-[10px] pb-2 font-normal align-top text-transparentGrey w-1/2 sm:w-1/3">
					<div className="sm:flex hidden  flex-row justify-between items-start">
						{columnHeaderTitles?.map((el, i) => {
							return (
								<div
									key={el.title}
									className={`flex  items-center justify-start text-start ${
										(isProjectsPage && i === 0 && "w-[45%]") ||
										(isProjectsPage && i === 1 && "w-[45%] lg:pl-0 pl-[5px]") ||
										(isStaffPlanPage && i === 0 && "w-[36%]") ||
										(isStaffPlanPage &&
											i === 1 &&
											"w-[55%] sm:pl-[8px] md:pl-[14px] lg:pl-0 pl-[14px]") ||
										"w-24"
									}
                                `}
								>
									{el.showIcon && (
										<div
											className={`mr-1 transform -translate-x-0.5 ${
												el.onIconClick ? "cursor-pointer" : ""
											}`}
											onClick={el?.onIconClick}
										>
											<PlusIcon className="w-4 h-4" />
										</div>
									)}
									<div
										className="flex  items-center justify-start text-start cursor-pointer"
										onClick={() => {
											if (el?.onClick) {
												el.onClick();
											}
											handleSorting(el.title);
										}}
									>
										<span>{el.title}</span>
										<div
											className={`transform ${
												sortedBy.title !== el.title ? "-rotate-90" : ""
											} 
                                  ${
																		sortedBy.title === el.title &&
																		sortedBy.sort === SORT_ORDER.ASC
																			? "-rotate-90"
																			: ""
																	} 
                                  ${
																		sortedBy.title === el.title &&
																		sortedBy.sort === SORT_ORDER.DESC
																			? "rotate-90"
																			: ""
																	} transition-transform duration-300 ease-in-out`}
										>
											<ChevronLeftIcon className="w-4 h-4" />
										</div>
									</div>
								</div>
							);
						})}
						<IconButton
							className={`-m-1 sm:ml-2 lg:ml-0 text-black flex items-center justify-center`}
							onClick={prevWeek}
							Icon={ChevronLeftIcon}
							iconSize={"h6 w-6"}
						/>
					</div>
				</th>
				{months?.map((month) => {
					return month.weeks.map((week, index) => {
						const { startDate, endDate } = getStartAndEndDatesOfWeek(
							month.year,
							Number(month.monthLabel),
							week.weekNumberOfTheMonth
						);
						const weekDateForTooltip = `${startDate} to ${endDate}`;

						const isCurrentWeek =
							currentWeek === week.weekNumberOfTheYear &&
							currentYear === month.year;
						return (
							<th
								key={`${month.monthLabel}-${index}`}
								className={`relative py-2 px-1 font-normal text-contrastBlue ${
									isCurrentWeek ? "bg-selectedColumnBg" : ""
								}`}
							>
								<div
									className={`relative group flex flex-col items-center sm:text-base text-2xl sm:w-[34px] w-[68px] ${
										currentWeek === week.weekNumberOfTheYear &&
										currentYear === month.year
											? "font-bold"
											: "font-normal"
									}`}
								>
									<span>
										{`W${week.weekNumberOfTheMonth}`}
										<span className="absolute w-[70px] top-[27px] left-1/2 -translate-x-1/2 text-[8px] leading-5 text-white font-normal bg-contrastBlue rounded-md opacity-0 z-10 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
											{weekDateForTooltip}
											<div className="block h-[11px] w-[11px] bg-contrastBlue  absolute top-[-5px] left-1/2 -translate-x-1/2 transform rotate-[135deg] clip-triangle rounded-bl-[0.5em]"></div>
										</span>
									</span>
									<span
										className={`${
											week.weekNumberOfTheMonth === 1 ||
											week.weekNumberOfTheMonth === 2
												? ""
												: "sm:hidden"
										}`}
									>
										{showMonthAndYear(
											month.year,
											month.monthLabel,
											week.weekNumberOfTheMonth
										)}
									</span>
								</div>
							</th>
						);
					});
				})}
				<th className="pl-0 pr-4 pt-1 pb-2 font-normal align-top w-1/2 sm:w-1/6">
					<div className="flex flex-row items-start">
						<IconButton
							className="sm:flex hidden pt-[2px] text-contrastBlue items-center justify-center"
							onClick={nextWeek}
							Icon={ChevronRightIcon}
							iconSize={"h6 w-6"}
						/>
					</div>
				</th>
			</tr>
			<button
				className={`absolute -top-[12px] left-1/2 transform -translate-x-1/2 bg-[#AFB3BF] text-[#151F33] rounded-[3px] px-[10px] py-[2px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]
                    opacity-0 pointer-events-none ${
											!isTodayInView ? "opacity-100 pointer-events-auto" : ""
										} transition-opacity duration-300 `}
				onClick={scrollToTodayFunction}
			>
				Today
			</button>
		</thead>
	);
};

export default CalendarHeader;
