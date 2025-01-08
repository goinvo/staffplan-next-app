'use client';
import React, { useState, useEffect } from "react";

import CalendarHeader from "./calendarHeader";
import { MonthsDataType, AssignmentType, ProjectType, ProjectSummaryInfoItem } from "@/app/typeInterfaces";
import { SORT_ORDER } from "./constants";
import { getNextWeeksPerView, getPrevWeeksPerView, getWeeksPerScreen } from "./helpers";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import useDynamicWeeks from "@/app/hooks/useDynamicWeeks";
import useSwipe from "@/app/hooks/useSwipe";

interface ScrollingCalendarProps {
	children: React.ReactNode;
	assignments: AssignmentType[] | ProjectType[] | AssignmentType | ProjectType
	columnHeaderTitles: {
		title: string;
		showIcon: boolean;
		onClick?: () => void;
	}[];
	title?: string;
	avatarUrl?: string;
	userName?: string;
	isActiveUser?: boolean;
	project?: ProjectType;
	projectInfo?: string;
	projectStatus?: string;
	editable?: boolean;
	draggableDates?: boolean;
	projectSummaryInfo?: ProjectSummaryInfoItem[];
	initialSorting: { title: string, sort: SORT_ORDER };
	onClick?: () => void;
}

export const ScrollingCalendar = ({
	children,
	assignments,
	columnHeaderTitles,
	title,
	avatarUrl,
	userName,
	isActiveUser,
	project,
	projectInfo,
	projectStatus,
	editable,
	draggableDates,
	projectSummaryInfo,
	initialSorting,
	onClick,
}: ScrollingCalendarProps) => {
	const [months, setMonths] = useState<MonthsDataType[]>([]);
	const { dateRange, setDateRange } = useGeneralDataContext();
	const weeksCount = useDynamicWeeks({
		baseWidth: 600,
		baseWeeksCount: 1,
		pixelsPerWeek: 42,
		isMobileCheck: true,
		minWeeks: 5
	});

	const handleSwipeLeft = () => {
		setDateRange(getNextWeeksPerView(months))
	};
	const handleSwipeRight = () => {
		setDateRange(getPrevWeeksPerView(months))
	};

	useSwipe({
		onSwipeLeft: handleSwipeLeft,
		onSwipeRight: handleSwipeRight,
	});

	useEffect(() => {
		const monthData = getWeeksPerScreen(dateRange, weeksCount);
		setMonths(monthData);
	}, [dateRange, weeksCount]);

	return (
		<div className="min-h-full timeline-grid-bg">
			<table className="min-w-full timeline-grid-bg text-contrastBlue text-sm border-none">
				<CalendarHeader
					months={months}
					assignments={assignments}
					columnHeaderTitles={columnHeaderTitles}
					avatarUrl={avatarUrl}
					userName={userName}
					isActiveUser={isActiveUser}
					title={title}
					project={project}
					projectInfo={projectInfo}
					projectStatus={projectStatus}
					editable={editable}
					draggableDates={draggableDates}
					projectSummaryInfo={projectSummaryInfo}
					initialSorting={initialSorting}
					onClick={onClick}
				/>
				<tbody>
					{React.Children.toArray(children).map((child) => {
						if (React.isValidElement(child)) {
							return React.cloneElement(child as React.ReactElement<any>, {
                months,
              });
						}
						return child;
					})}

				</tbody>
			</table>
		</div>
	);
};
