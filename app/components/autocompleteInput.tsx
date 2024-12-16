'use client'

import React, { useState, forwardRef } from "react";

interface AutocompleteProps<T> {
    items: T[];
    onItemSelect: (item: T) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    displayKey: keyof T;
    inputName?: string;
    inputClassName?: string;
    dropdownClassName?: string;
    listClassName?: string;
    value: string;
    tabIndex?: number
    isNewItem?: boolean
}

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteProps<any>>(
    ({
        items,
        onItemSelect,
        onChange,
        onBlur,
        placeholder = "Search...",
        label,
        displayKey,
        inputName = "autocomplete",
        inputClassName = "",
        dropdownClassName = "",
        listClassName = "",
        value,
        tabIndex,
        isNewItem
    }, ref) => {
        const [filteredItems, setFilteredItems] = useState<any[]>(items);
        const [showDropdown, setShowDropdown] = useState<boolean>(false);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value.toLowerCase();

            if (onChange) {
                onChange(e);
            }
            if (inputValue) {
                const filtered = items.filter(item =>
                    String(item[displayKey]).toLowerCase().includes(inputValue)
                );
                setFilteredItems(filtered);
                setShowDropdown(true);
            } else {
                setFilteredItems(items);
            }
            setShowDropdown(true);
        };

        const handleItemSelect = (item: any) => {
            onItemSelect(item);
            setShowDropdown(false);
        };

        const handleInputFocus = () => {
            setShowDropdown(true);
        };

        const handleInputBlur = () => {
            setTimeout(() => setShowDropdown(false), 200);
        };

        const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
            onBlur?.(e)
        }

        return (
            <div className="relative flex flex-col w-full" onBlur={handleInputBlur} >
                {label && <label className="py-1 text-tiny">{label}</label>}
                <input
                    ref={ref}
                    type="text"
                    name={inputName}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleBlur}
                    autoComplete="off"
                    className={`px-2 text-tiny shadow-top-input-shadow rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-contrastBlue appearance-none ${inputClassName}`}
                    placeholder={placeholder}
                    value={value}
                    tabIndex={tabIndex}
                />
                {showDropdown && !!filteredItems.length && (
                    <ul className={`absolute bg-white rounded-md border border-gray-300 max-h-40 overflow-y-auto w-full z-10 left-0 top-full mt-1 ${dropdownClassName}`}>
                        {filteredItems.map(item => (
                            <li
                                key={String(item.id)}
                                className={`hover:bg-gray-200 cursor-pointer text-left px-1 ${listClassName}`}
                                onMouseDown={() => handleItemSelect(item)}
                            >
                                {String(item[displayKey])}
                            </li>
                        ))}
                    </ul>
                )}
                {isNewItem &&
                    <span className="absolute top-[5px] right-[3px] px-1 pt-[3px] pb-1 text-white text-xs leading-[12px] bg-[#AFB3BF] rounded-[3px]">
                        new
                    </span>
                }
            </div>
        );
    }
);


AutocompleteInput.displayName = "AutocompleteInput";
