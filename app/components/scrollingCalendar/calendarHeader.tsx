'use client'
import { useState } from 'react';
import Image from 'next/image';

import { SlPencil } from "react-icons/sl";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";

import ColumnChart from '../columnChart';
import IconButton from '../iconButton';

import { useUserDataContext } from '@/app/userDataContext';
import { AssignmentType, MonthsDataType, ProjectType } from '@/app/typeInterfaces';
import { calculateTotalHoursPerWeek, isBeforeWeek, showMonthAndYear } from './helpers';
import ViewsMenu from '../viewsMenu/viewsMenu';
import EditFormController from './editFormController';

interface ColumnHeaderTitle {
    title: string;
    showIcon: boolean;
    onClick?: () => void;
}

type CalendarHeaderProps = {
    assignments: AssignmentType[] | AssignmentType | ProjectType[] | ProjectType,
    months: MonthsDataType[],
    avatarUrl?: string,
    title?: string,
    userName?: string,
    editable?: boolean,
    projectInfo?: string,
    columnHeaderTitles: ColumnHeaderTitle[],
    selectedColumn: string | null
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    assignments,
    months,
    avatarUrl,
    title,
    userName,
    editable = false,
    projectInfo,
    columnHeaderTitles,
    selectedColumn }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { setDateRange, scrollToTodayFunction } = useUserDataContext();
    const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } = calculateTotalHoursPerWeek(assignments as AssignmentType[], months)

    const nextQuarter = () => {
        setDateRange(prev => {
            const nextQuarter = (prev.quarter % 4) + 1;
            const nextYear = nextQuarter === 1 ? prev.year + 1 : prev.year;
            return { quarter: nextQuarter, year: nextYear };
        });
    };

    const prevQuarter = () => {
        setDateRange(prev => {
            const prevQuarter = prev.quarter === 1 ? 4 : prev.quarter - 1;
            const prevYear = prevQuarter === 4 ? prev.year - 1 : prev.year;
            return { quarter: prevQuarter, year: prevYear };
        });
    };
    const hasActualHoursForWeek = (year: number, week: number) => {
        return !!totalActualHours[`${year}-${week}`];
    };

    return (
        <thead>
            <tr className="pl-5 border-bottom bg-contrastBlue min-h-28 text-white flex">
                <th className="flex w-1/3 mr-1 px-0 py-5">
                    {isEditing ? (
                        <EditFormController onClose={() => setIsEditing(false)} />
                    ) : (
                        <div className='flex text-white items-center'>
                            {avatarUrl && (
                                <div className="px-2 py-2 relative overflow-hidden w-[92px] h-[67px] aspect-[92/67] mr-4">
                                    <Image
                                        src={avatarUrl}
                                        fill
                                        sizes="(max-width: 640px) 80px, (max-width: 768px) 92px, 92px"
                                        className='rounded-lg object-cover'
                                        alt='Avatar'
                                    />
                                </div>
                            )}
                            <div className='flex flex-col items-start'>
                                <div className='flex items-center'>
                                    <div className='text-huge text-left overflow-wrap break-word leading-snug'>{title || userName}</div>
                                    {editable && (
                                        <IconButton
                                            className='py-1 pl-4'
                                            iconSize='w-4 h-4'
                                            onClick={() => setIsEditing(true)}
                                            Icon={SlPencil}
                                        />
                                    )}
                                </div>
                                {projectInfo && (
                                    <div className='text-left overflow-wrap break-word py-2 font-normal'>{projectInfo}</div>
                                )}
                            </div>

                        </div>)
                    }
                </th>
                {months?.map((month) => {
                    return month.weeks.map((week) => {
                        const columnIdentifier = `${month.monthLabel}-${week}`;
                        return (<th key={`month-${month.monthLabel}-week-${week}`}
                            className={`relative px-1 ${selectedColumn === columnIdentifier ? 'navbar font-bold' : 'font-normal'}`}>
                            <ColumnChart
                                hasActualHoursForWeek={hasActualHoursForWeek(month.year, week)}
                                height={hasActualHoursForWeek(month.year, week) ? totalActualHours[`${month.year}-${week}`] : totalEstimatedHours[`${month.year}-${week}`]}
                                proposedHours={proposedEstimatedHours[`${month.year}-${week}`]}
                                maxValue={maxTotalHours}
                                isBeforeWeek={isBeforeWeek(week, month)}
                            />
                        </th>)
                    });
                })}
                <th className="pr-4 pl-2 py-2 w-1/6">
                    <div className="flex flex-row justify-between">
                        <ViewsMenu />
                        <button
                            onClick={scrollToTodayFunction}
                        >
                            Today
                        </button>
                    </div>
                </th>
            </tr>
            <tr className="flex border-b border-gray-300 pl-5">
                <th className="px-0 pt-1 pb-2 font-normal align-top text-transparentGrey w-1/3">
                    <div className='flex flex-row justify-between items-start'>
                        {columnHeaderTitles?.map((el, i) => {
                            return (
                                <div key={el.title} className={`w-24 flex items-center justify-start text-start ${el.onClick ? 'cursor-pointer' : ''}`} onClick={el?.onClick}>
                                    {el.showIcon && (<PlusIcon className='w-4 h-4 mr-1' />)}
                                    <span>{el.title}</span>
                                </div>)
                        })}
                        <IconButton className='pt-2 text-black flex items-center justify-center' onClick={prevQuarter} Icon={ChevronLeftIcon} iconSize={'h6 w-6'} />
                    </div>
                </th>
                {months?.map((month) => {
                    return month.weeks.map((week, index) => {
                        const columnIdentifier = `${month.monthLabel}-${week}`;
                        return (
                            <th key={`${month.monthLabel}-${index}`} className={`relative py-2 px-1 font-normal text-contrastBlue ${selectedColumn === columnIdentifier ? 'bg-selectedColumnBg' :

                                ''}`}>
                                <div className={`flex flex-col items-center w-[34px] ${selectedColumn === columnIdentifier ? 'font-bold' : 'font-normal'}`}>
                                    <span>{`W${index + 1}`}</span>
                                    {index === 0 && <span>{showMonthAndYear(month.year, month.monthLabel)}</span>}
                                </div>
                            </th>)

                    });
                })}
                <th className="pl-0 pr-4 pt-1 pb-2 font-normal align-top w-1/6">
                    <IconButton className='pt-2 text-contrastBlue flex items-center justify-center'
                        onClick={nextQuarter}
                        Icon={ChevronRightIcon}
                        iconSize={'h6 w-6'} />
                </th>
            </tr>
        </thead >
    )
}

export default CalendarHeader;

