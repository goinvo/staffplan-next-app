'use client';
import React, { useState, useEffect, useCallback } from "react";

import CalendarHeader from "./calendarHeader";
import { MonthsDataType, AssignmentType, ProjectType } from "@/app/typeInterfaces";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { MONTHS_COUNT, MONTS_PER_SCREEN_SIZE } from "./constants";
import { getWeeksPerScreen } from "./helpers";
import { useGeneralDataContext } from "@/app/contexts/generalContext";

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
	const { dateRange } = useGeneralDataContext();
	const isMobile = useMediaQuery('(max-width: 640px)');
	const isXSmallScreen = useMediaQuery('(max-width: 1216px')
	const isSmallScreen = useMediaQuery('(min-width: 1217px) and (max-width: 1388px)');
	const isMediumScreen = useMediaQuery('(min-width: 1389px) and (max-width: 1560px)');
	const isLargeScreen = useMediaQuery('(min-width: 1561px) and (max-width: 1799px)');

	const detectWeeksAmountPerScreen = useCallback(() => {
		if (isMobile) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.MOBILE]
		if (isXSmallScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.X_SMALL]
		if (isSmallScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.SMALL]
		if (isMediumScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.MEDIUM]
		if (isLargeScreen) return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.LARGE]
		return MONTHS_COUNT[MONTS_PER_SCREEN_SIZE.X_LARGE]
	}, [isLargeScreen, isMediumScreen, isSmallScreen, isXSmallScreen, isMobile]);

	useEffect(() => {
		const monthData = getWeeksPerScreen(dateRange, detectWeeksAmountPerScreen())
		setMonths(monthData)
	}, [dateRange, detectWeeksAmountPerScreen]);

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
