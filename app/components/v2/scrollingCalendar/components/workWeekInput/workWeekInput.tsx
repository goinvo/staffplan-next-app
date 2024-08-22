'use client'
import React, { FocusEvent, useRef, useCallback } from 'react';
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { Formik, Field, Form, FormikHelpers } from 'formik';

interface CustomInputProps {
    value: number;
    onChange: (value: number) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const WorkWeekInput: React.FC<CustomInputProps> = ({
    value,
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
        <Formik
            initialValues={{ input: value }}
            onSubmit={(values: { input: number }, { setSubmitting }: FormikHelpers<{ input: number }>) => {
                onChange(values.input);
                setSubmitting(false);
            }}
        >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
                <Form onSubmit={handleSubmit} className="relative my-1">
                    <Field
                        name="input"
                        value={values.input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange(e);
                            setFieldValue('input', parseFloat(e.target.value) || 0);
                        }}
                        onFocus={handleFocus}
                        onBlur={(e: FocusEvent<HTMLInputElement>) => {
                            handleBlur(e);
                            handleSubmit();
                        }}
                        disabled={disabled}
                        className={`bg-white text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] focus:border-tiffany focus:ring-1 focus:ring-tiffany border-none focus:border-tiffany outlined-none mb-0 px-0 py-0`}
                    />
                    <button
                        ref={buttonRef}
                        type="button"
                        className="absolute left-0 top-full h-[12px] w-[34px] border-2 flex items-center justify-center bg-transparent border-transparent rounded-b-sm invisible"
                        onClick={() => handleSubmit()}
                    >
                        <ArrowLongRightIcon className="w-6 text-white" />
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default WorkWeekInput;