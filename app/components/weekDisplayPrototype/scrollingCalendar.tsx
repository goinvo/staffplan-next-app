import React from "react";
import { DateTime } from "luxon";
import { useUserDataContext } from "@/app/userDataContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getMondays, getMonths, showYear } from "./helpers";

export const currentQuarter = Math.floor((DateTime.now().month - 1) / 3) + 1;
export const currentYear = DateTime.now().year;
export const ScrollingCalendar = ({ children }: any) => {
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

	const startOfQuarter = DateTime.local(
		dateRange.year,
		3 * (dateRange.quarter - 1) + 1,
		1
	).startOf("day");
	const endOfQuarter = DateTime.local(dateRange.year, 3 * dateRange.quarter, 1)
		.endOf("month")
		.startOf("day");

	const months = getMonths(startOfQuarter, endOfQuarter);
	return (
		<div className="w-full flex items-start overflow-hidden">
			<button
				className="p-2 bg-white rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"
				onClick={prevQuarter}
			>
				<FaChevronLeft className="timeline-text-accent" />
			</button>
			<div className="flex-grow flex justify-between">
				{months.map((monthData, index) => (
					<div key={index} className="flex-1">
						<h2>{showYear(monthData)}</h2>
						<div className="flex justify-between pr-10">
							{(() => {
								const { mondays } = getMondays(
									DateTime.local(
										dateRange.year,
										parseInt(monthData.monthLabel),
										1
									).toISO()
								);
								return mondays.map((day, dayIndex) => (
									<div key={dayIndex} className="flex">
										{day}
									</div>
								));
							})()}
						</div>
						{React.Children.map(children, (child) =>
							React.cloneElement(child as React.ReactElement<any>, {
								monthData,
								isFirstMonth: index === 0,
								isLastMonth: index === months.length - 1,
							})
						)}
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
