'use client'

import { useEffect, useState } from 'react';

const useIsMobile = (breakpoint: number = 640) => {
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < breakpoint);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect) {
                    setIsMobile(entry.contentRect.width < breakpoint);
                }
            }
        });

        observer.observe(document.body);

        return () => observer.disconnect();
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;


