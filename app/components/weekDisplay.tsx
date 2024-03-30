'use client'
import React, { useState, useEffect, useMemo, ReactNode } from "react";
import useInfiniteScroll, {
    InfiniteScrollRef,
    ScrollDirection,
} from "react-easy-infinite-scroll-hook";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SideList, { sideListGutterHeight } from "./sideList";
import { render } from "@testing-library/react";
import { getWeek, setWeek, isAfter, eachWeekOfInterval, addDays, addWeeks, format, differenceInWeeks } from "date-fns";
import { useUserDataContext } from "../userDataContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { get } from "http";
import { throttle } from 'lodash';

export interface SideLabelComponents {
    labelContents: React.ReactNode[];
    setDivHeights: (heights: number[]) => void;
    offset: number;
};

export type WeekDisplayProps = {
    labelContents: React.ReactNode[];
    onMouseOverWeek?: (week: number, year: number, cellId: number) => void;
    onMouseClickWeek?: (week: number, year: number, cellId: number) => void;
    renderCell?: (week: number, year: number, cellId: number, isSelected: boolean, width?: number, height?: number) => ReactNode;
    selectedCell?: selectedCell;
};

export type selectedCell = {
    week: number;
    year: number;
    rowId: number;
};

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

    const firstDate = addDays(currentDate, 1);
    const lastDate = new Date(beginYear, 11, 31);

    const weeksInYear = eachWeekOfInterval({ start: firstDate, end: lastDate });

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
        const currentMonthLabel = months[weeksInYear[dateIndex].getMonth()] + (weeksInYear[dateIndex].getMonth() === 0 ? " " + weeksInYear[dateIndex].getFullYear() : "");
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
const WeekDisplay: React.FC<WeekDisplayProps> = ({ labelContents, onMouseOverWeek, onMouseClickWeek, renderCell, selectedCell }) => {
    const today = new Date();
    const startYear = today.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [data, setData] = useState<WeeksAndLabels>(generateWeeksForYear(startYear));
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [yearWindow, setYearWindow] = useState<YearWindow>({ start: startYear, end: startYear });
    const [sideLabelDivHeights, setSideLabelDivHeights] = useState<number[]>([]);
    const { setScrollToTodayFunction } = useUserDataContext();

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

        // Get the week and year from the search params
        const year = parseInt(currentUrl.searchParams.get("year") ?? today.getFullYear().toString());
        const week = parseInt(currentUrl.searchParams.get("week") ?? getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 }).toString());

        const weeksToScroll = differenceInWeeks(today, setWeek(new Date(year, 0, 1), week, { weekStartsOn: 1, firstWeekContainsDate: 1 }))

        // Scroll to today and update the URL params
        const container = weekContainerRef.current;
        if (container) {
            container.scrollBy({
                left: weeksToScroll * weekWidth,
                behavior: "smooth",
            });

            window.history.pushState({}, "", `?year=${today.getFullYear()}&week=${getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 })}`);
        }
    };

    // Create a throttled version of the pushNewUrl function
    const throttledPushNewUrl = useMemo( // Needs to be memoized so it doesn't generate a new function each time
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
            const currentYear = parseInt(currentUrl.searchParams.get("year") ?? today.getFullYear().toString());
            const currentWeek = parseInt(currentUrl.searchParams.get("week") ?? getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 }).toString());

            if (currentWeek) {
                const currentDate = new Date(currentYear, 0, 1 + (currentWeek - 1) * 7);
                const newDate = addWeeks(currentDate, direction === "left" ? -weeksToScroll : weeksToScroll);
                const newYear = parseInt(format(newDate, 'yyyy'));
                const newWeek = Math.floor((newDate.getTime() - new Date(newYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

                throttledPushNewUrl(newYear, newWeek);
            }

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
            const currentDateIndex = Math.floor(container.scrollLeft / weekWidth + sideOffsetItems);
            const currentWeek = data.weeks[currentDateIndex];
            if (currentWeek) {
                throttledPushNewUrl(currentWeek.year, currentWeek.week);
            }
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
    }, []);

    return (
        <div className="relative">
            <SideList labelContents={labelContents} setDivHeights={setSideLabelDivHeights} offset={48} />
            <div className="flex items-center my-4">
                <button onClick={() => scrollWeeks('left')} className="p-2 rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"><FaChevronLeft className="timeline-text-accent" /></button>
                <div
                    ref={weekContainerRef}
                    className="flex flex-row overflow-x-auto scrollbar-hide cursor-grab"
                    onMouseDown={onDragStart}
                >
                    <div className="flex min-w-max select-none">
                        {data.weeks.map((week, index) => (
                            <div className="flex flex-col text-nowrap" style={{ width: weekWidth + "px" }} key={index}>
                                <div className="flex flex-row grow text-sm">{data.monthLabels[index]}</div>
                                <div className={"flex flex-row grow-0 text-sm"}>{week.date}
                                    {week.week === getWeek(today, { weekStartsOn: 1, firstWeekContainsDate: 1 }) && week.year === today.getFullYear() ? <div className="flex flex-row items-center text-xs text-red-500">Today</div> : <></>}
                                </div>
                                <div className={"flex flex-row grow-0 relative"}>
                                    <div className={"top-0 left-0 timeline-grid-gap-bg"} style={{ width: weekWidth + "px" }} key={index}>
                                        {sideLabelDivHeights.map((height, rowIndex) => {
                                            return <div className="flex border-l timeline-grid-bg timeline-grid-border" style={{ height: height + sideListGutterHeight * 2, marginBottom: sideListGutterHeight }} key={rowIndex}
                                                onMouseOver={onMouseOverWeek ? () => onMouseOverWeek(week.week, week.year, rowIndex) : () => { }}
                                                onMouseDown={onMouseClickWeek ? () => onMouseClickWeek(week.week, week.year, rowIndex) : () => { }}>
                                                {
                                                    <div className="flex flex-col">
                                                        {renderCell ? renderCell(week.week, week.year, rowIndex, (selectedCell && selectedCell.week === week.week && selectedCell.year === week.year && selectedCell.rowId == rowIndex) || false, weekWidth, height + sideListGutterHeight * 2) : <div></div>}
                                                    </div>
                                                }
                                            </div>
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => scrollWeeks('right')} className="p-2 rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"><FaChevronRight className="timeline-text-accent" /></button>
                {isLoading && <div>Loading...</div>}
            </div>
        </div>
    );
};

export default WeekDisplay;
