	import React from "react";
	import { DateTime } from "luxon";
	import { useUserDataContext } from "@/app/userDataContext";
	import { Month } from "./month";
	import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

	export const currentQuarter = Math.floor((DateTime.now().month - 1) / 3) + 1;
	export const currentYear = DateTime.now().year;
	export const ScrollingCalendar = () => {
		const { dateRange, setDateRange } = useUserDataContext();
		const nextQuarter = () => {
			const activeQuarter = (prevQuarter: any) => {
				const nextQuarter = (prevQuarter % 4) + 1;
				const activeYear = () => {
					if (prevQuarter === 4) {
						return dateRange.year + 1;
					}
					return dateRange.year;
				};
				return { quarter: nextQuarter, year: activeYear() };
			};
			setDateRange(activeQuarter(dateRange.quarter));
		};

		const prevQuarter = () => {
			const activeQuarter = (prevQuarter: any) => {
				const previousQuarter = prevQuarter === 1 ? 4 : prevQuarter - 1;
				const activeYear = () => {
					if (previousQuarter === 4) {
						return dateRange.year - 1;
					}
					return dateRange.year;
				};
				return { quarter: previousQuarter, year: activeYear() };
			};
			setDateRange(activeQuarter(dateRange.quarter));
		};

		const getMondaysByMonth = (startDate: any, endDate: any) => {
			const start = DateTime.fromISO(startDate);
			const end = DateTime.fromISO(endDate);

			return Array.from(
				{ length: end.diff(start, "months").months + 1 },
				(_, index) => {
					const monthStart = start.plus({ months: index }).startOf("month");
					const monthEnd = start.plus({ months: index }).endOf("month");

					const mondays = Array.from(
						{ length: monthEnd.diff(monthStart, "days").days + 1 },
						(_, dayIndex) => {
							const day = monthStart.plus({ days: dayIndex });
							return day.weekday === 1 ? day.day : null;
						}
					).filter((day) => day !== null);
					return {
						monthLabel: monthStart.toFormat("M"),
						year: dateRange.year,
						mondays,
					};
				}
			);
		};

		const startOfQuarter = DateTime.local(
			dateRange.year,
			3 * (dateRange.quarter - 1) + 1,
			1
		).startOf("day");
		const endOfQuarter = DateTime.local(dateRange.year, 3 * dateRange.quarter, 1)
			.endOf("month")
			.startOf("day");

		console.log(startOfQuarter, endOfQuarter, "start and end of quarter");
		const mondaysByMonth = getMondaysByMonth(startOfQuarter, endOfQuarter);
		return (
			<div className="w-full flex items-center overflow-hidden">
				<button
					className="p-2 bg-white rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"
					onClick={prevQuarter}
				>
					<FaChevronLeft className="timeline-text-accent" />
				</button>
				<div className="flex-grow flex justify-between">
					{mondaysByMonth.map((monthData, index) => (
						<div key={index} className="flex-1">
							<Month monthData={monthData} />
						</div>
					))}
				</div>
				<button
					className="p-2 bg-white rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"
					onClick={nextQuarter}
				>
					<FaChevronRight className="timeline-text-accent" />
				</button>
			</div>
		);
	};