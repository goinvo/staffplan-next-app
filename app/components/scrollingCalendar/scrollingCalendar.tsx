'use client';
import React, { useState, useEffect } from "react";

import CalendarHeader from "./calendarHeader";
import { MonthsDataType, AssignmentType, ProjectType, ProjectSummaryInfoItem } from "@/app/typeInterfaces";
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
	projectInfo?: string;
	editable?: boolean;
	draggableDates?: boolean;
	projectSummaryInfo?: ProjectSummaryInfoItem[]
}

export const ScrollingCalendar = ({
	children,
	assignments,
	columnHeaderTitles,
	title,
	avatarUrl,
	userName,
	projectInfo,
	editable,
	draggableDates,
	projectSummaryInfo
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
		<div className="min-h-screen h-auto timeline-grid-bg">
			<table className="min-w-full timeline-grid-bg text-contrastBlue text-sm border-none">
				<CalendarHeader
					months={months}
					assignments={assignments}
					columnHeaderTitles={columnHeaderTitles}
					avatarUrl={avatarUrl}
					userName={userName}
					title={title}
					projectInfo={projectInfo}
					editable={editable}
					draggableDates={draggableDates}
					projectSummaryInfo={projectSummaryInfo}
				/>
				<tbody>
					{React.Children.map(children, (child) =>
						React.cloneElement(child as React.ReactElement<any>, {
							months,
						})
					)}
				</tbody>
			</table>
		</div>
	);
};
