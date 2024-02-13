'use client'
import React, { useRef, useState } from 'react';

const WeekDisplay: React.FC = () => {
    const weekContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);

    const weeks = Array.from({ length: 52 }, (_, i) => i * 7); // Generate weeks
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
    React.useEffect(() => {
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
            <div
                ref={weekContainerRef}
                className="overflow-x-auto flex grow cursor-grab"
                onMouseDown={onDragStart}
            >
                <div className="flex space-x-2 min-w-max select-none">
                    {weeks.map((week, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span>{week}</span>
                            {index % 4 === 0 && <span>{months[Math.floor(index / 4) % 12]}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default WeekDisplay;
