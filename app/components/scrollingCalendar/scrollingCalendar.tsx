'use client';
import React, { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";

import { useUserDataContext } from "@/app/userDataContext";
import CalendarHeader from "./calendarHeader";
import { MonthsDataType, AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { getMonthsWithWeeks } from "./helpers";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { MONTHS_COUNT, MONTS_PER_SCREEN_SIZE } from "./constants";

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
	editable?: boolean;
}

export const ScrollingCalendar = ({
	children,
	assignments,
	columnHeaderTitles,
	title,
	avatarUrl,
	userName,
	projectInfo,
	editable
}: ScrollingCalendarProps) => {
	const [months, setMonths] = useState<MonthsDataType[]>([]);
	const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
	const { dateRange } = useUserDataContext();
	const isSmallScreen = useMediaQuery('(max-width: 1299px)');
	const isMediumScreen = useMediaQuery('(min-width: 1299px) and (max-width: 1499px)');
	const isLargeScreen = useMediaQuery('(min-width: 1500px) and (max-width: 1799px)');

	const detectMonthsCountPerScreen = useCallback(() => {
		if (isSmallScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.SMALL]
		if (isMediumScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.MEDIUM]
		if (isLargeScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.LARGE]
		return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.X_LARGE]
	}, [isLargeScreen, isMediumScreen, isSmallScreen]);

	useEffect(() => {
		const startOfQuarter = DateTime.local(dateRange.year, 3 * (dateRange.quarter - 1) + 1, 1);
		const endOfQuarter = DateTime.local(dateRange.year, 3 * dateRange.quarter, 1).endOf('month');
		const monthsData = getMonthsWithWeeks(startOfQuarter.toISO(), endOfQuarter.toISO(), detectMonthsCountPerScreen());
		setMonths(monthsData);
	}, [dateRange, detectMonthsCountPerScreen]);

	const handleCellClick = useCallback((monthLabel: string | null, week: number | null) => {
		const columnIdentifier = `${monthLabel}-${week}`;
		if (selectedColumn !== columnIdentifier) {
			setSelectedColumn(columnIdentifier);
		}
	}, [selectedColumn]);

	return (
		<table className="min-w-full timeline-grid-bg text-contrastBlue text-sm h-screen border-none">
			<CalendarHeader
				months={months}
				assignments={assignments}
				columnHeaderTitles={columnHeaderTitles}
				avatarUrl={avatarUrl}
				userName={userName}
				title={title}
				selectedColumn={selectedColumn}
				projectInfo={projectInfo}
				editable={editable}
			/>
			<tbody>
				{React.Children.map(children, (child) =>
					React.cloneElement(child as React.ReactElement<any>, {
						months,
						selectedColumn,
						handleCellClick
					})
				)}
			</tbody>
		</table>
	);
};
