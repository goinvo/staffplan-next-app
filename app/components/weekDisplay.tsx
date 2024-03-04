
'use client'
import React, { useState, useRef, useEffect } from "react";
import useInfiniteScroll, {
    InfiniteScrollRef,
    ScrollDirection
} from "react-easy-infinite-scroll-hook";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const { getWeek, eachWeekOfInterval, differenceInCalendarDays, addDays } = require('date-fns');

type WeekEntry = {
    date: number;
    month: string;
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

const generateWeeksForYear = (beginYear: number, startDate: Date = new Date()): WeeksAndLabels => {
    const weeks: WeekEntry[] = [];
    const monthLabels: string[] = [];

    let currentDate = new Date(beginYear, 0, 1)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonthLabel = "";

    const firstDate = addDays(currentDate, 1);
    const lastDate = new Date(beginYear, 11, 31);

    const weeksInYear = eachWeekOfInterval({ start: firstDate, end: lastDate });

    // If the first week is in the previous year, skip it
    if (weeksInYear[0].getFullYear() < beginYear) {
        weeksInYear.shift();
    }

    for (const date of weeksInYear) {
        weeks.push({
            date: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear(),
        });

        // Determine if the month label should be added
        const currentMonthLabel = months[date.getMonth()] + (date.getMonth() === 0 ? " " + date.getFullYear() : "");
        if (lastMonthLabel !== currentMonthLabel) {
            monthLabels.push(currentMonthLabel);
            lastMonthLabel = currentMonthLabel;
        } else {
            monthLabels.push(""); // No label for this entry
        }
    }

    return { weeks, monthLabels };
};

const weekWidth = 32;

const WeekDisplay = () => {
    const today = new Date();
    const startYear = today.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [data, setData] = useState<WeeksAndLabels>(createItems(startYear + 1)); // This is called twice at start, so offset it so the years are correct
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [yearWindow, setYearWindow] = useState<YearWindow>({ start: startYear + 1, end: startYear + 1 });

    const loadMoreWeeks = async (direction: ScrollDirection) => {
        try {
            if (direction === ScrollDirection.LEFT) {
                yearWindow.start -= 1;
                console.log(weekContainerRef);
                const newData = await loadMore(yearWindow.start);

                setIsLoading(true);
                setScrollStartX(scrollStartX + (weekWidth * newData.weeks.length));

                setData((prev) => ({ weeks: [...newData.weeks, ...prev.weeks], monthLabels: [...newData.monthLabels, ...prev.monthLabels] } as WeeksAndLabels));
            } else {
                yearWindow.end += 1;
                const newData = await loadMore(yearWindow.end);
                setIsLoading(true);

                setData((prev) => ({ weeks: [...prev.weeks, ...newData.weeks], monthLabels: [...prev.monthLabels, ...newData.monthLabels] } as WeeksAndLabels));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const weekContainerRef: InfiniteScrollRef<HTMLDivElement> = useInfiniteScroll({
        next: loadMoreWeeks,
        columnCount: data.weeks.length,
        hasMore: { left: true, right: true },
        scrollThreshold: 0.1,
        windowScroll: false,
    });

    const scrollToToday = () => {
        const today = new Date();
        const weekIndex = data.weeks.findIndex(week => {
            const weekDate = new Date(today.getFullYear(), months.indexOf(week.month), week.date);
            return today >= weekDate;
        });
        const container = weekContainerRef.current;
        if (container && weekIndex >= 0) {
            const child = container.children[0].children[weekIndex] as HTMLElement;
            container.scrollLeft = child.offsetLeft - container.offsetLeft;
        }
    };

    const scrollWeeks = (direction: 'left' | 'right') => {
        const container = weekContainerRef.current;
        if (container) {
            const scrollWidth = container.offsetWidth;
            container.scrollBy({ left: (direction == 'left' ? -scrollWidth : scrollWidth), behavior: 'smooth' });
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
        }

    };

    const onDragEnd = () => {
        setIsDragging(false);
    };

    // Attach global event listeners for mouse move and mouse up
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onDragMove);
            window.addEventListener('mouseup', onDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', onDragMove);
            window.removeEventListener('mouseup', onDragEnd);
        };
    }, [isDragging, onDragMove]);

    return (
        <div className="relative">
            <div className="flex items-center my-4">
                <button onClick={() => scrollWeeks('left')} className="p-2 rounded-md mx-4 shadow min-h-12 min-w-10 flex items-center justify-center"><FaChevronLeft className="timeline-text-accent" /></button>
                <div
                    ref={weekContainerRef}
                    className="flex flex-row overflow-x-auto cursor-grab scrollbar-hide"
                    onMouseDown={onDragStart}
                >
                    <div className="flex min-w-max select-none">
                        {data.weeks.map((week, index) => (
                            <div className="flex flex-col text-nowrap" style={{ width: weekWidth + "px" }} key={index}>
                                <div className="flex flex-row grow text-sm">{data.monthLabels[index]}</div>
                                <div className={"flex flex-row grow-0 text-sm"}>{week.date}</div>
                                <div className={"flex flex-row grow-0 h-32 border-l relative"}>
                                    <div className={"h-32 top-0 left-0 absolute bg-gray-100"} style={{ width: weekWidth + "px" }}></div>
                                    {(week.year == 2023 && week.date == 31 && week.month == 'Dec') &&
                                        <div className="w-32 h-8 bg-gray-400 border rounded absolute top-0 left-0 z-40">
                                            {getWeek(new Date(week.year, months.indexOf(week.month), week.date))}
                                        </div>
                                    }
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
}

export default WeekDisplay;