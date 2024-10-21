import { useState, useEffect } from 'react';

type SwipeCallback = () => void;

interface UseSwipeOptions {
    onSwipeLeft?: SwipeCallback;
    onSwipeRight?: SwipeCallback;
    minSwipeDistance?: number;
}

const useSwipe = ({
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50,
}: UseSwipeOptions): void => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            setTouchEnd(null);
            setTouchStart(e.targetTouches[0].clientX);
        };

        const handleTouchMove = (e: TouchEvent) => {
            setTouchEnd(e.targetTouches[0].clientX);
        };

        const handleTouchEnd = () => {
            if (touchStart === null || touchEnd === null) return;

            const distance = touchStart - touchEnd;
            if (Math.abs(distance) < minSwipeDistance) return;

            if (distance > 0) {
                onSwipeLeft?.();
            } else {
                onSwipeRight?.();
            }
        };
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, minSwipeDistance]);
}

export default useSwipe;