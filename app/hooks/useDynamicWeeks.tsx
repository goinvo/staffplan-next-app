'use client'

import { useState, useEffect, useCallback } from "react";

interface UseDynamicWeeksOptions {
    baseWidth: number;
    baseWeeksCount: number;
    pixelsPerWeek: number;
    isMobileCheck?: boolean;
    minWeeks?: number;
}

const useDynamicWeeks = ({ baseWidth, baseWeeksCount, pixelsPerWeek, isMobileCheck, minWeeks }: UseDynamicWeeksOptions) => {
    const [weeksCount, setWeeksCount] = useState(baseWeeksCount);

    const detectWeeksAmountPerScreen = useCallback((width: number) => {
        if (isMobileCheck && width < 640) {
            return 1;
        }
        const additionalWeeks = Math.floor((width - baseWidth) / pixelsPerWeek);
        let totalWeeks = baseWeeksCount + Math.max(0, additionalWeeks);
        if (minWeeks) {
            totalWeeks = Math.max(totalWeeks, minWeeks);
        }

        return totalWeeks;
    }, [baseWidth, baseWeeksCount, pixelsPerWeek, isMobileCheck, minWeeks]);

    useEffect(() => {
        const handleResize = (entries: ResizeObserverEntry[]) => {
            const { width } = entries[0].contentRect;
            setWeeksCount(detectWeeksAmountPerScreen(width));
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(document.documentElement);

        return () => observer.disconnect();
    }, [detectWeeksAmountPerScreen]);

    return weeksCount;
};

export default useDynamicWeeks;