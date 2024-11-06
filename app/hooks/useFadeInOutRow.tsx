'use client'

import { useRef } from "react";

interface FadeInOutRowOptions {
    rowRef: React.RefObject<HTMLTableRowElement>;
    setShowUndoRow?: React.Dispatch<React.SetStateAction<boolean>>;
    minHeight?: number;
    maxHeight?: number;
    heightStep?: number;
    opacityStep?: number;
}

export const useFadeInOutRow = ({ rowRef, setShowUndoRow, opacityStep = 0.05, heightStep = 4, minHeight = 26, maxHeight = 100 }: FadeInOutRowOptions) => {
    const animationFrameId = useRef<number | null>(null);
    const isAnimating = useRef(false);

    const animateRow = (isFadingOut: boolean): Promise<void> => {
        return new Promise((resolve) => {
            if (isAnimating.current || !rowRef.current) {
                resolve();
                return;
            }
            isAnimating.current = true;
            const element = rowRef.current;

            if (!isFadingOut) {
                element.style.zIndex = '20';
            }

            let opacity = 1;
            let height = isFadingOut ? element.offsetHeight : minHeight;

            const step = () => {
                if (isFadingOut) {
                    opacity -= opacityStep;
                    height -= heightStep;
                } else {
                    height += heightStep;
                }

                element.style.opacity = `${opacity}`;
                element.style.height = `${height}px`;

                if ((isFadingOut && height > minHeight) || (!isFadingOut && height < maxHeight)) {
                    animationFrameId.current = requestAnimationFrame(step);
                } else {
                    isAnimating.current = false;
                    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                    if (isFadingOut) {
                        setShowUndoRow?.(true);
                    } else {
                        element.style.zIndex = '';
                    }
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    };

    return {
        animateRow,
    };
};
