'use client'
import React, { FocusEvent, useRef, useCallback } from 'react';

import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { Field } from 'formik';

interface CustomInputProps {
    value: number | string;
    name: string;
    id: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    onSubmit?: (values: any) => void;
    disabled?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    value,
    name,
    id,
    onChange,
    onFocus,
    onBlur,
    disabled
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        if (buttonRef.current) {
            buttonRef.current.style.opacity = '1';
            buttonRef.current.style.visibility = 'visible';
            buttonRef.current.style.backgroundColor = '#27B5B0';
            buttonRef.current.style.outline = '1px solid #27B5B0';
        }
        if (onFocus) onFocus(event);
    }, [onFocus]);

    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
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
            <Field
                name={name}
                value={value}
                id={id}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={(e: FocusEvent<HTMLInputElement>) => {
                    handleBlur(e);
                }}
                disabled={disabled}
                className={`bg-white text-center rounded-sm shadow-top-input-shadow w-[34px] h-[25px] focus:border-tiffany focus:ring-1 focus:ring-tiffany border-none focus:border-tiffany outlined-none mb-0 px-0 py-0`}
            />
            <button
                ref={buttonRef}
                type="button"
                className="absolute left-0 top-full h-[12px] w-[34px] border-2 flex items-center justify-center bg-transparent border-transparent rounded-b-sm invisible"
            >
                <ArrowLongRightIcon className="w-6 text-white" />
            </button>
        </div>
    );
};
