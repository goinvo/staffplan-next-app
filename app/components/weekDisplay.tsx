
'use client'
import React, { use, useEffect, useRef, useState } from 'react';

type WeekEntry = {
    date: number;
    month: string;
    year: string;
};

type WeeksAndLabels = {
    weeks: WeekEntry[];
    monthLabels: string[];
};

type IndexWindow = {
    min: number;
    max: number;
};

const WeekDisplay: React.FC = () => {
    const windowScrollThreshold = 100;
    const numWeeks = 52;
    const startYear = 2024;
    const weekContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [indexWindow, setIndexWindow] = useState<IndexWindow>({ min: 0, max: numWeeks });
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);

    // Starting date for the component. This will be the date when the index is 0. We recommend 1 Jan 2024, as it's a Monday.
    const startDate = new Date(startYear, 0, 1);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [weeks, setWeeks] = useState<WeekEntry[]>([]);
    const [monthLabels, setMonthLabels] = useState<string[]>([]);
    const [currDistFromLeft, setCurrDistFromLeft] = useState(0);
    const [currDistFromRight, setCurrDistFromRight] = useState(0);

    const generateWeeksForYear = (beginYear: number, numWeeks: number = 52): WeeksAndLabels => {
        const weeks: WeekEntry[] = [];
        const monthLabels: string[] = [];

        // Calculate the offset for the first week relative to 2024-01-01 by finding the number of days between the two dates and modulo 7 (add 7 to ensure positive result)
        let currentDate = new Date(beginYear, 0, 1)
        const offset = Math.abs(currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) % 7;
        currentDate.setDate(currentDate.getDate() + offset); // Clone the beginDate to avoid mutating the original date
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let lastMonthLabel = "";

        for (let i = 0; i < numWeeks; i++) {
            weeks.push({
                date: currentDate.getDate(),
                month: months[currentDate.getMonth()],
                year: currentDate.getFullYear().toString(),
            });

            // Determine if the month label should be added
            const currentMonthLabel = months[currentDate.getMonth()] + (currentDate.getMonth() === 0 ? " " + currentDate.getFullYear() : "");
            if (lastMonthLabel !== currentMonthLabel) {
                monthLabels.push(currentMonthLabel);
                lastMonthLabel = currentMonthLabel;
            } else {
                monthLabels.push(""); // No label for this entry
            }

            currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
        }

        return { weeks, monthLabels };
    };

    // On component mount, generate the weeks and month labels and scroll to today
    useEffect(() => {
        const { weeks, monthLabels } = generateWeeksForYear(startYear, numWeeks);
        setWeeks(weeks);
        setMonthLabels(monthLabels);
        scrollToToday();
        console.log(weekContainerRef);
    }, []);

    const scrollToToday = () => {
        const today = new Date();
        const weekIndex = weeks.findIndex(week => {
            const weekDate = new Date(today.getFullYear(), months.indexOf(week.month), week.date);
            return today >= weekDate;
        });
        const container = weekContainerRef.current;
        if (container && weekIndex >= 0) {
            const child = container.children[0].children[weekIndex] as HTMLElement;
            container.scrollLeft = child.offsetLeft - container.offsetLeft;
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

    const scrollLeft = () => {
        console.log("scroll left");
    };

    const scrollRight = () => {
        console.log("scroll right");
    };

    const onDragMove = (event: MouseEvent) => {
        if (!isDragging) return;
        const dx = event.pageX - startX;
        const container = weekContainerRef.current;
        if (container) {
            const newScrollPosition = scrollStartX - dx;
            container.scrollLeft = newScrollPosition;

            if (container.scrollLeft - indexWindow.min < windowScrollThreshold) {
                console.log("scroll left");
                scrollLeft();
            } else if (container.scrollLeft - indexWindow.min > container.scrollWidth - container.clientWidth - windowScrollThreshold) {
                scrollRight();
            }
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
        <div className="flex items-center space-x-4 my-4">
            <button onClick={scrollToToday} className="p-2 rounded-full bg-gray-300">Today</button>
            <div
                ref={weekContainerRef}
                className="overflow-x-auto flex grow cursor-grab scrollbar-hide"
                onMouseDown={onDragStart}
            >
                <div className="flex space-x-2 min-w-max select-none">
                    {weeks.map((week, index) => (
                        <div key={index} className="flex flex-col w-8 text-nowrap">
                            <div className="flex flex-row grow">{monthLabels[index]}</div>
                            <div className={"flex flex-row grow-0" + (index == selectedIndex ? " bg-gray-300" : "")} onClick={(e) => setSelectedIndex(index)}>{week.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeekDisplay;
