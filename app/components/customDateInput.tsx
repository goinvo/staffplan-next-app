'use client';

import { CalendarIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";

interface CustomDateInputProps {
    name: string;
    value: string;
    errorString?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    setError: (error: string | undefined) => void;
}

export const CustomDateInput: React.FC<CustomDateInputProps> = ({ name, value, onChange, setError, onBlur, errorString }) => {
    const [manualInput, setManualInput] = useState<string>("");
    const textInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setManualInput(value ? DateTime.fromISO(value).toFormat("dd.LLL.yy") : "");
    }, [value]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isoDate = e.target.value;
        onChange(isoDate);
        setManualInput(DateTime.fromISO(isoDate).toFormat("dd.LLL.yy"));
        setError(undefined)
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setManualInput(rawValue);

        const parsedDate = DateTime.fromFormat(rawValue, "dd.LLL.yy");

        if (parsedDate.isValid) {
            const isoDate = parsedDate.toISODate();
            onChange(isoDate);
            setError(undefined);
        }
    };

    const handleBlur = () => {
        const parsedDate = DateTime.fromFormat(manualInput, "dd.LLL.yy");
        if (!parsedDate.isValid) {
            setError(errorString || 'Invalid Date');
        } else {
            setError(undefined);
        }
    };

    const getCalendarValue = (): string => {
      if (manualInput.trim() === "") {
        return DateTime.now().toISODate();
      }

      const parsedDate = DateTime.fromFormat(manualInput, "dd.LLL.yy");
      if (parsedDate.isValid) {
        return parsedDate.toISODate();
      }

      return DateTime.now().toISODate();
    };

    return (
        <div className="relative flex items-center w-full px-0">
            <input
                ref={textInputRef}
                type="text"
                name={`${name}`}
                value={manualInput}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="dd/Mon/yr"
                className="h-6 w-full pl-1 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-r-0 border-gray-300 outline-none"
            />
            <CalendarIcon className="absolute right-1 h-4 w-4 text-black" />
            <input
                type="date"
                value={getCalendarValue()}
                onChange={handleDateChange}
                className={`absolute top-0 pr-0 pl-0 opacity-0 right-0 w-1/4 h-full`}
            />
        </div>
    );
};

export default CustomDateInput;
