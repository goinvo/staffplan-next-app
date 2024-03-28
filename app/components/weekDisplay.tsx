'use client'
import React, { useState, useEffect, ReactNode } from "react";
import useInfiniteScroll, {
    InfiniteScrollRef,
    ScrollDirection,
} from "react-easy-infinite-scroll-hook";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SideList, { sideListGutterHeight } from "./sideList";
import { render } from "@testing-library/react";
import { getWeek, setWeek, isAfter, eachWeekOfInterval, addDays, differenceInWeeks } from "date-fns";
import { useUserDataContext } from "../userDataContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { get } from "http";

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

const createItems = (year: number): WeeksAndLabels =>
    generateWeeksForYear(year);

const loadMore = async (year: number): Promise<WeeksAndLabels> =>
    new Promise((res) => setTimeout(() => res(createItems(year))));

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

export const weekWidth = 64;

const sideOffsetItems = 5;

const WeekDisplay: React.FC<WeekDisplayProps> = ({ labelContents, onMouseOverWeek, onMouseClickWeek, renderCell, selectedCell }) => {
    const today = new Date();
    const startYear = today.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [data, setData] = useState<WeeksAndLabels>(createItems(startYear));
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [yearWindow, setYearWindow] = useState<YearWindow>({ start: startYear, end: startYear });
    const [sideLabelDivHeights, setSideLabelDivHeights] = useState<number[]>([]);
    const { setScrollToTodayFunction } = useUserDataContext();

    const router = useRouter();
    const searchParams = useSearchParams();

    const loadMoreWeeks = async (direction: ScrollDirection) => {
        try {
            if (direction === ScrollDirection.LEFT) {
                yearWindow.start -= 1;
                const newData = await loadMore(yearWindow.start);

                setIsLoading(true);
                setScrollStartX(scrollStartX + weekWidth * newData.weeks.length);

                setData(
                    (prev) =>
                    ({
                        weeks: [...newData.weeks, ...prev.weeks],
                        monthLabels: [...newData.monthLabels, ...prev.monthLabels],
                    } as WeeksAndLabels)
                );
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

    const weekContainerRef: InfiniteScrollRef<HTMLDivElement> = useInfiniteScroll(
        {
            next: loadMoreWeeks,
            columnCount: data.weeks.length,
            hasMore: { left: true, right: true },
            scrollThreshold: 0.1,
            windowScroll: false,
        }
    );

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

    const scrollWeeks = (direction: "left" | "right") => {
        const container = weekContainerRef.current;
        if (container) {
            const scrollWidth = container.offsetWidth;
            container.scrollBy({
                left: direction == "left" ? -scrollWidth : scrollWidth,
                behavior: "smooth",
            });

            const currentDateIndex = Math.floor(container.scrollLeft / weekWidth + sideOffsetItems);
            const currentWeek = data.weeks[currentDateIndex];

            if (currentWeek) {
                pushNewUrl(currentWeek.year, currentWeek.week);
            }
        }
    };

    const onDragStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsDragging(true);
        setStartX(event.pageX);
        const container = weekContainerRef.current;
        if (container) {
            setScrollStartX(container.scrollLeft);
        }
    };

    const onDragMove = (event: MouseEvent) => {
        if (!isDragging) return;
        const container = weekContainerRef.current;
        if (container) {
            const dx = event.pageX - startX;
            const newScrollPosition = scrollStartX - dx;
            container.scrollLeft = newScrollPosition;

            const currentDateIndex = Math.floor(container.scrollLeft / weekWidth + sideOffsetItems);
            const currentWeek = data.weeks[currentDateIndex];

            if (currentWeek) {
                pushNewUrl(currentWeek.year, currentWeek.week);
            }
        }
    };

    async function pushNewUrl(year: number, week: number) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("year", year.toString());
        currentUrl.searchParams.set("week", week.toString());
        window.history.pushState({}, "", currentUrl.toString());
    }

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
