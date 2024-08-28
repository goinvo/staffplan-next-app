'use client';
import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";

import { useUserDataContext } from "@/app/userDataContext";
import CalendarHeader from "./calendarHeader";
import { MonthsDataType, AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { getMonthsWithWeeks } from "./helpers";

interface ScrollingCalendarProps {
	children: React.ReactNode;
	assignments: AssignmentType[] | ProjectType[] | AssignmentType | ProjectType
	columnHeaderTitles: {
		title: string;
		showIcon: boolean;
	}[];
	title?: string;
	avatarUrl?: string;
	userName?: string;
	projectInfo?: string;
}

export const ScrollingCalendar = ({
	children,
	assignments,
	columnHeaderTitles,
	title,
	avatarUrl,
	userName,
	projectInfo
}: ScrollingCalendarProps) => {
	const [months, setMonths] = useState<MonthsDataType[]>([]);
	const { dateRange } = useUserDataContext();

	useEffect(() => {
		const startOfQuarter = DateTime.local(dateRange.year, 3 * (dateRange.quarter - 1) + 1, 1);
		const endOfQuarter = DateTime.local(dateRange.year, 3 * dateRange.quarter, 1).endOf('month');
		const monthsData = getMonthsWithWeeks(startOfQuarter.toISO(), endOfQuarter.toISO(), 5);
		setMonths(monthsData);
	}, [dateRange]);

	return (
		<table className="min-w-full timeline-grid-bg text-contrastBlue text-sm h-screen">
			<CalendarHeader
				months={months}
				assignments={assignments}
				columnHeaderTitles={columnHeaderTitles}
				avatarUrl={avatarUrl}
				userName={userName}
				title={title}
				projectInfo={projectInfo}
			/>
			<tbody>
				{React.Children.map(children, (child) =>
					React.cloneElement(child as React.ReactElement<any>, {
						months
					})
				)}
			</tbody>
		</table>
	);
};
