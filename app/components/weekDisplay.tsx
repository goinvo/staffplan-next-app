"use client";
import React, { useState, useEffect, useMemo, ReactNode } from "react";
import useInfiniteScroll, {
	InfiniteScrollRef,
	ScrollDirection,
} from "react-easy-infinite-scroll-hook";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SideListLeft, { sideListGutterHeight } from "./sideListLeft";
import SideListRight from "./sideListRight";
import ProjectSummary from "./allProjectsSummary";
import { render } from "@testing-library/react";
import {
	getWeek,
	setWeek,
	isAfter,
	eachWeekOfInterval,
	addDays,
	addWeeks,
	format,
	differenceInWeeks,
} from "date-fns";
import { useUserDataContext } from "../userDataContext";
import { WeekDisplayProps, selectedCell } from "../typeInterfaces";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { get } from "http";
import { throttle } from "lodash";

type WeekEntry = {
	date: number;
	week: number;
	month: number;
	year: number;
};

type WeeksAndLabels = {
	weeks: WeekEntry[];
	monthLabels: string[];
};

type YearWindow = {
	start: number;
	end: number;
};

// This function is called whenever scrolling is needed to load more weeks. Weeks are generated asynchronously
const loadMore = async (year: number): Promise<WeeksAndLabels> =>
	new Promise((res) => setTimeout(() => res(generateWeeksForYear(year))));

// This function generates a block of 52 weeks and the corresponding labels for the months they belong to
const generateWeeksForYear = (beginYear: number): WeeksAndLabels => {
	const weeks: WeekEntry[] = [];
	const monthLabels: string[] = [];

	let currentDate = new Date(beginYear, 0, 1);
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	let lastMonthLabel = "";
	const lastDate = new Date(beginYear, 11, 31);

	const weeksInYear = eachWeekOfInterval({ start: currentDate, end: lastDate });

	// If the first week is in the previous year, skip it
	if (weeksInYear[0].getFullYear() < beginYear) {
		weeksInYear.shift();
	}

	for (let dateIndex = 0; dateIndex < weeksInYear.length; dateIndex++) {
		weeks.push({
			date: weeksInYear[dateIndex].getDate(),
			week: getWeek(weeksInYear[dateIndex]),
			month: weeksInYear[dateIndex].getMonth(),
			year: weeksInYear[dateIndex].getFullYear(),
		});

		// Determine if the month label should be added
		const currentMonthLabel =
			months[weeksInYear[dateIndex].getMonth()] +
			(weeksInYear[dateIndex].getMonth() === 0
				? " " + weeksInYear[dateIndex].getFullYear()
				: "");
		if (lastMonthLabel !== currentMonthLabel) {
			monthLabels.push(currentMonthLabel);
			lastMonthLabel = currentMonthLabel;
		} else {
			monthLabels.push(""); // No label for this entry
		}
	}

	return { weeks, monthLabels };
};

// This is the width, in pixels, of the rendered row representing each week
export const weekWidth = 64;

// This dictates how much to offset where from the side of the screen current date is
// At 5, the current date will be 5 weeks from the left side of the screen
const sideOffsetItems = 5;

// The main component that renders the week display
const WeekDisplay: React.FC<WeekDisplayProps> = ({
	labelContentsLeft,
	labelContentsRight,
	onMouseOverWeek,
	onMouseClickWeek,
	onCellFocus,
	onCellBlur,
	renderCell,
	selectedCell,
	drawerContents
}) => {
	const today = new Date();
	const startYear = today.getFullYear();
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const [data, setData] = useState<WeeksAndLabels>(
		generateWeeksForYear(startYear)
	);
	const [startX, setStartX] = useState(0);
	const [scrollStartX, setScrollStartX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [yearWindow, setYearWindow] = useState<YearWindow>({
		start: startYear,
		end: startYear,
	});
	const [sideLabelDivHeightsLeft, setSideLabelDivHeightsLeft] = useState<
		number[]
	>([]);
	const [sideLabelDivHeightsRight, setSideLabelDivHeightsRight] = useState<
		number[]
	>([]);
	const [drawerIndex, setdrawerIndex] = useState<number>(-1);
	const { setScrollToTodayFunction } = useUserDataContext();
	const drawerRef = React.useRef<HTMLDivElement>(null);
	const [drawerHeight, setDrawerHeight] = useState(0);
	const router = useRouter();
	const searchParams = useSearchParams();

	// This is the async function that is called to load more weeks when necessary
	const loadMoreWeeks = async (direction: ScrollDirection) => {
		try {
			// If we scroll too much to the left, we need to load more weeks from the previous year
			if (direction === ScrollDirection.LEFT) {
				// Adjust the year window, which dictates which years are currently loaded
				yearWindow.start -= 1;
				const newData = await loadMore(yearWindow.start);

				// Offset the scroll position by the width of the newly loaded weeks so dragging isn't wonky
				setIsLoading(true);
				setScrollStartX(scrollStartX + weekWidth * newData.weeks.length);

				// Update the data of what needs to be rendered on the screen accordingly
				setData(
					(prev) =>
					({
						weeks: [...newData.weeks, ...prev.weeks],
						monthLabels: [...newData.monthLabels, ...prev.monthLabels],
					} as WeeksAndLabels)
				);
				// If we scroll too much to the right, we need to load more weeks from the next year
			} else {
				yearWindow.end += 1;
				const newData = await loadMore(yearWindow.end);
				setIsLoading(true);

				setData(
					(prev) =>
					({
						weeks: [...prev.weeks, ...newData.weeks],
						monthLabels: [...prev.monthLabels, ...newData.monthLabels],
					} as WeeksAndLabels)
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// This is the reference to the div that contains the weeks
	// We use the InfiniteScrollRef hook to handle scrolling infinitely in both directions
	const weekContainerRef: InfiniteScrollRef<HTMLDivElement> = useInfiniteScroll(
		{
			next: loadMoreWeeks,
			columnCount: data.weeks.length,
			hasMore: { left: true, right: true },
			scrollThreshold: 0.1,
			windowScroll: false,
		}
	);

	// This function scrolls to the current date
	const scrollToToday = () => {
		const today = new Date();

		// For some reason the router isn't updating the search params when the URL changes, so pull it directly
		const currentUrl = new URL(window.location.href);

		// Get the week and year from local storage, or use the current date if not available
		const storedYear = localStorage.getItem("year");
		const storedWeek = localStorage.getItem("week");
		const year = storedYear ? parseInt(storedYear) : today.getFullYear();
		const week = storedWeek
			? parseInt(storedWeek)
			: getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 });

		const weeksToScroll = differenceInWeeks(
			today,
			setWeek(new Date(year, 0, 1), week, {
				weekStartsOn: 1,
				firstWeekContainsDate: 1,
			})
		);

		// Scroll to today and update the URL params
		const container = weekContainerRef.current;
		if (container) {
			container.scrollBy({
				left: weeksToScroll * weekWidth,
				behavior: "smooth",
			});

			pushNewUrl(
				today.getFullYear(),
				getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 })
			);
		}

		// Update the local storage with the current week and year
		localStorage.setItem("year", today.getFullYear().toString());
		localStorage.setItem(
			"week",
			getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 }).toString()
		);
	};

	// Create a throttled version of the pushNewUrl function
	const throttledPushNewUrl = useMemo(
		// Needs to be memoized so it doesn't generate a new function each time
		() =>
			throttle((year: number, week: number) => {
				pushNewUrl(year, week);
			}, 1000), // Limit to every second
		[]
	);

	// This function scrolls the weeks to the left or right when the respective button is clicked
	const scrollWeeks = (direction: "left" | "right") => {
		const container = weekContainerRef.current;
		if (container) {
			const scrollWidth = container.offsetWidth;
			const weeksToScroll = Math.floor(scrollWidth / weekWidth);
			const currentUrl = new URL(window.location.href);

			// Get the week and year from local storage, or use the current date if not available
			const storedYear = localStorage.getItem("year");
			const storedWeek = localStorage.getItem("week");
			const currentYear = storedYear
				? parseInt(storedYear)
				: today.getFullYear();
			const currentWeek = storedWeek
				? parseInt(storedWeek)
				: getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 });

			if (currentWeek) {
				const currentDate = new Date(currentYear, 0, 1 + (currentWeek - 1) * 7);
				const newDate = addWeeks(
					currentDate,
					direction === "left" ? -weeksToScroll : weeksToScroll
				);
				const newYear = parseInt(format(newDate, "yyyy"));
				const newWeek = getWeek(newDate, {
					weekStartsOn: 1,
					firstWeekContainsDate: 1,
				});

				// Push the new week and year to local storage synchronously and to the URL asynchronously
				localStorage.setItem("year", newYear.toString());
				localStorage.setItem("week", newWeek.toString());
				throttledPushNewUrl(newYear, newWeek);
			}

			console.log(
				"scrolling",
				direction,
				scrollWidth,
				" as weeks: ",
				weeksToScroll
			);

			container.scrollBy({
				left: direction === "left" ? -scrollWidth : scrollWidth,
				behavior: "smooth",
			});
		}
	};

	// This function is called when the user starts dragging the weeks
	const onDragStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setIsDragging(true);

		// Save the initial mouse position when dragging starts
		setStartX(event.pageX);
		const container = weekContainerRef.current;

		// Save the current scroll position when dragging starts
		if (container) {
			setScrollStartX(container.scrollLeft);
		}
	};

	// This function is called when the user is dragging the weeks
	const onDragMove = (event: MouseEvent) => {
		if (!isDragging) return;

		const container = weekContainerRef.current;
		if (container) {
			// Calculate the new scroll position based on the mouse movement
			const dx = event.pageX - startX;
			const newScrollPosition = scrollStartX - dx;
			container.scrollLeft = newScrollPosition;

			// Update the URL params to reflect the current week
			const currentDateIndex = Math.floor(
				container.scrollLeft / weekWidth + sideOffsetItems
			);
			const currentWeek = data.weeks[currentDateIndex];
			if (currentWeek) {
				throttledPushNewUrl(currentWeek.year, currentWeek.week);
			}
			// Update the local storage with the current week and year
			localStorage.setItem("year", currentWeek.year.toString());
			localStorage.setItem("week", currentWeek.week.toString());
		}
	};

	// This function updates the URL params to reflect the current week
	function pushNewUrl(year: number, week: number) {
		router.push(`?year=${year}&week=${week}`, { scroll: false });
	}

	// This function is called when the user stops dragging the weeks
	const onDragEnd = () => {
		setIsDragging(false);
	};

	// Attach global event listeners for mouse move and mouse up
	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", onDragMove);
			window.addEventListener("mouseup", onDragEnd);
		}

		return () => {
			window.removeEventListener("mousemove", onDragMove);
			window.removeEventListener("mouseup", onDragEnd);
		};
	}, [isDragging, onDragMove]);

	// This function is called when the component is first mounted to link the scrollToToday function to the UserDataContext
	useEffect(() => {
		setScrollToTodayFunction(() => scrollToToday);

		// TODO: Remove this when the project drawer is implemented
		setdrawerIndex(4);
	}, []);

	useEffect(() => {
		// Set drawer height according to the height of the drawer contents
		if (drawerRef.current) {
			setDrawerHeight(drawerRef.current.offsetHeight);
			console.log("Drawer Height: ", drawerRef.current.offsetHeight);
		}
	}, [drawerIndex]);

	const handleSetSideLabelDivHeightsLeft = (heights: number[]) => {
		const updatedTotalHeights = [...heights];
		let wasRightSideUpdated = false;

		// For each height on the right side, if it's less than the new height from the left side, mark that we need to update the right side
		sideLabelDivHeightsRight.forEach((height, index) => {
			if (height < sideLabelDivHeightsRight[index]) {
				wasRightSideUpdated = true;
			}

			// Update the total height to be the maximum of the two
			updatedTotalHeights[index] = Math.max(
				updatedTotalHeights[index] || 0,
				height
			);
		});
		setSideLabelDivHeightsLeft([...updatedTotalHeights]);

		// If the right side was updated, update the right side
		if (wasRightSideUpdated) {
			setSideLabelDivHeightsRight([...updatedTotalHeights]);
		}
	};

	const handleSetSideLabelDivHeightsRight = (heights: number[]) => {
		const updatedTotalHeights = [...heights];
		let wasLeftSideUpdated = false;

		// For each height on the left side, if it's less than the new height from the right side, mark that we need to update the left side
		sideLabelDivHeightsLeft.forEach((height, index) => {
			if (height < sideLabelDivHeightsRight[index]) {
				wasLeftSideUpdated = true;
			}

			// Update the total height to be the maximum of the two
			updatedTotalHeights[index] = Math.max(
				updatedTotalHeights[index] || 0,
				height
			);
		});
		setSideLabelDivHeightsRight([...updatedTotalHeights]);

		console.log("Right Side Heights: ", updatedTotalHeights);

		// If the left side was updated, update the left side
		if (wasLeftSideUpdated) {
			const newLeftSideHeights = [...updatedTotalHeights];
			setSideLabelDivHeightsLeft(newLeftSideHeights);
		}
	};

	return (
		<div className="relative">
			{/* <SideListLeft
				labelContents={labelContentsLeft}
				divHeights={sideLabelDivHeightsLeft}
				setDivHeights={handleSetSideLabelDivHeightsLeft}
				offset={48}
				drawerIndex={drawerIndex}
				drawerHeight={drawerHeight}
			/> */}
			{labelContentsRight && (
				<SideListRight
					labelContents={labelContentsRight}
					divHeights={sideLabelDivHeightsRight}
					setDivHeights={handleSetSideLabelDivHeightsRight}
					offset={48}
					drawerIndex={drawerIndex}
					drawerHeight={drawerHeight}
				/>
			)}
			<div className="flex items-center my-4 relative">
				<button
					onClick={() => scrollWeeks("left")}
					className="p-2 bg-white rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center absolute -left-3 -top-3"
				>
					<FaChevronLeft className="timeline-text-accent" />
				</button>
				<div
					ref={weekContainerRef}
					className="flex flex-row overflow-x-auto scrollbar-hide cursor-grab select-none"
					onMouseDown={onDragStart}
				>
					<div className="flex flex-col min-w-max select-none">
						<div className="flex flex-row">
							{data.weeks.map((week, index) => (
								<div
									className="flex flex-col text-nowrap"
									style={{ width: weekWidth + "px" }}
									key={index}
								>
									<div className="flex flex-row grow text-sm">
										{data.monthLabels[index]}
									</div>
									<div className={"flex flex-row grow-0 text-sm"}>
										{week.date}
										{week.week ===
											getWeek(today, {
												weekStartsOn: 1,
												firstWeekContainsDate: 1,
											}) && week.year === today.getFullYear() ? (
											<div className="flex flex-row items-center text-xs text-red-500">
												Today
											</div>
										) : (
											<></>
										)}
									</div>

								</div>
							))}
						</div>
						{labelContentsLeft.map((contents, rowIndex) => {
							const sideLabelDivHeight = Math.max(
								sideLabelDivHeightsLeft[rowIndex] || 0,
								sideLabelDivHeightsRight[rowIndex] || 0
							);
							const selectedCell = JSON.parse(localStorage.getItem("selectedCell") || "{}");

							return (
								<div key={rowIndex}>
									<div
										className="flex flex-row timeline-grid-bg"
										style={{
											height: sideLabelDivHeight + sideListGutterHeight * 2,
											marginBottom: sideListGutterHeight,
										}}
									>
										{data.weeks.map((week, index) => (
											<div
												className="flex flex-col border-l timeline-grid-gap-bg timeline-grid-border"
												style={{ width: weekWidth + "px" }}
												key={index}
												onMouseOver={
													onMouseOverWeek ? () => onMouseOverWeek(week.week, week.year, rowIndex) : () => { }
												}
												onMouseDown={
													onMouseClickWeek ? () => onMouseClickWeek(week.week, week.year, rowIndex) : () => { }
												}
												onFocus={onCellFocus ? () => onCellFocus(week.week, week.year, rowIndex) : () => { }}
												onBlur={onCellBlur ? () => onCellBlur(week.week, week.year, rowIndex) : () => { }}
											>
												{renderCell ? (
													renderCell(
														week.week,
														week.year,
														rowIndex,
														(selectedCell &&
															selectedCell.week === week.week &&
															selectedCell.year === week.year &&
															selectedCell.rowId === rowIndex) ||
														false,
														weekWidth,
														sideLabelDivHeight + sideListGutterHeight * 2
													)
												) : (
													<div></div>
												)}
											</div>
										))}
									</div>
									{drawerIndex === rowIndex && drawerContents &&
										<>
											<div className="flex flex-row" style={{ height: drawerHeight + "px" }} ref={drawerRef} />
											<div className="flex flex-row absolute left-0" style={{ top: (40 + sideListGutterHeight * 2 * (drawerIndex + 1) + sideListGutterHeight * drawerIndex + sideLabelDivHeightsRight.slice(0, drawerIndex + 1).reduce((sum, num) => sum + num, 0)) + "px" }} ref={drawerRef}>
												{drawerContents}
											</div>
										</>}
								</div>
							);
						})}
					</div>
				</div>
				<button
					onClick={() => scrollWeeks("right")}
					className="p-2 bg-white rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center absolute -right-1 -top-3"
				>
					<FaChevronRight className="timeline-text-accent" />
				</button>
				{isLoading && <div>Loading...</div>}
			</div>
		</div>
	);
};

export default WeekDisplay;
