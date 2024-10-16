import React, { FocusEvent, forwardRef, useCallback, KeyboardEvent } from 'react';
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

interface CustomInputProps {
    value: number | string;
    name: string;
    id: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onFillForwardClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
    value,
    name,
    id,
    onChange,
    onFocus,
    onBlur,
    onFillForwardClick,
    onKeyDown,
    disabled,
    className
}, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        if (buttonRef.current) {
            buttonRef.current.style.opacity = '1';
            buttonRef.current.style.pointerEvents = 'auto';
            buttonRef.current.style.backgroundColor = '#27B5B0';
            buttonRef.current.style.outline = '1px solid #27B5B0';
        }
        if (onFocus) onFocus(event);
    }, [onFocus]);

    const resetButtonStyles = () => {
        if (buttonRef.current) {
            buttonRef.current.style.opacity = '0';
            buttonRef.current.style.pointerEvents = 'none';
            buttonRef.current.style.backgroundColor = 'transparent';
            buttonRef.current.style.borderColor = 'transparent';
        }
    };

    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
        // If clicked on arrow button
        if (event.relatedTarget === buttonRef.current) {
            onFillForwardClick?.();
            resetButtonStyles();
            return;
        }

        resetButtonStyles();
        if (onBlur) onBlur(event);
    }, [onBlur]);

    return (
        <div className={`relative my-1 ${className || ''}`}>
            <input
                name={name}
                value={value}
                id={id}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={(e: FocusEvent<HTMLInputElement>) => {
                    handleBlur(e);
                }}
                onKeyDown={onKeyDown}
                disabled={disabled}
                className="bg-white text-center sm:text-base text-2xl rounded-sm shadow-top-input-shadow sm:w-[34px] w-[68px] sm:h-[25px] h-[50px] focus:border-tiffany focus:ring-1 focus:ring-tiffany border-none outlined-none mb-0 px-0 py-0"
                autoComplete="off"
                ref={ref}
            />
            <button
                ref={buttonRef}
                type="button"
                className="sm:flex hidden absolute left-0 top-full h-[12px] sm:w-[34px] w-[68px] border-2 flex items-center justify-center bg-transparent border-transparent rounded-b-sm opacity-0 pointer-events-none transition-opacity duration-200"
            >
                <ArrowLongRightIcon className="w-6 text-white" />
            </button>
        </div>
    );
});

CustomInput.displayName = "CustomInput";