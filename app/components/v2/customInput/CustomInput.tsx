'use client'
import React, { ChangeEvent, FocusEvent, useRef, useCallback } from 'react';
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

interface CustomInputProps {
    value: number;
    onChange: (value: number) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
    value,
    onChange,
    onFocus,
    onBlur,
    className = '',
    disabled
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        // const newValue = parseFloat(event.target.value);
        // onChange(isNaN(newValue) ? 0 : newValue);
    };

    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        // Show button and adjust styles on focus
        if (buttonRef.current) {
            buttonRef.current.style.opacity = '1';
            buttonRef.current.style.visibility = 'visible';
            buttonRef.current.style.backgroundColor = '#27B5B0';
            buttonRef.current.style.outline = '1px solid #27B5B0'
        }
        if (onFocus) onFocus(event);
    }, [onFocus]);

    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
        // Hide button and reset styles on blur
        if (buttonRef.current) {
            buttonRef.current.style.opacity = '0';
            buttonRef.current.style.visibility = 'hidden';
            buttonRef.current.style.backgroundColor = 'transparent';
            buttonRef.current.style.borderColor = 'transparent';
        }
        if (onBlur) onBlur(event);
    }, [onBlur]);

    return (
        <div className="relative my-1">
            <input
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                ref={inputRef}
                disabled={disabled}
                className={`bg-white text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] focus:border-tiffany focus:ring-1 focus:ring-tiffany border-none focus:border-tiffany outlined-none mb-0 px-0 py-0" ${className}`}
            />
            <button
                ref={buttonRef}
                className="absolute left-0 top-full h-[12px] w-[34px] border-2 flex items-center justify-center bg-transparent border-transparent rounded-b-sm invisible"
            >
                <ArrowLongRightIcon className="w-6 text-white" />
            </button>
        </div>
    );
};

export default CustomInput;

