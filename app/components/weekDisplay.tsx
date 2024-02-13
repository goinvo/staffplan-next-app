
'use client'
import React, { useEffect, useRef, useState } from 'react';

type WeekEntry = {
    date: number;
    month: string;
    year: string;
};

const WeekDisplay: React.FC = () => {
    const weekContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);

    // Starting date for the component
    const startDate = new Date(2024, 0, 1);
    const weeks: WeekEntry[] = [];
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Days in each month, assuming February has 28 days (non-leap year)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let currentDate = new Date(startDate);
    let monthLabels: string[] = [];
    let lastMonthLabel = "";

    for (let i = 0; i < 52; i++) {
        weeks.push({
            date: currentDate.getDate(),
            month: months[currentDate.getMonth()],
            year: currentDate.getMonth() === startDate.getFullYear() ? currentDate.getFullYear().toString() : "",
        });
        if (lastMonthLabel !== months[currentDate.getMonth()]) {
            lastMonthLabel = months[currentDate.getMonth()];
            monthLabels.push(lastMonthLabel);
        } else {
            monthLabels.push("");
        }

        currentDate.setDate(currentDate.getDate() + 7);
    }

    console.log(weeks);

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

    useEffect(() => {
        // Optionally, auto-scroll to today on component mount
        scrollToToday();
    }, []);

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
        const dx = event.pageX - startX;
        const container = weekContainerRef.current;
        if (container) {
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
        <div className="flex items-center space-x-4 my-4">
            <button onClick={scrollToToday} className="p-2 rounded-full bg-gray-300">Today</button>
            <div
                ref={weekContainerRef}
                className="overflow-x-auto flex grow cursor-grab"
                onMouseDown={onDragStart}
            >
                <div className="flex space-x-2 min-w-max select-none">
                    {weeks.map((week, index) => (
                        <div key={index} className="flex flex-col">
                            <div className="flex flex-row grow">{monthLabels[index]}</div>
                            <div className="flex flex-row grow-0">{week.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeekDisplay;
