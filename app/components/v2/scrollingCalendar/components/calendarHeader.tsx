'use client'
import { useState } from 'react';
import Image from 'next/image';

import { SlPencil } from "react-icons/sl";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";

import ColumnChart from '../../columnChart/columnChart';
import IconButton from '../../iconButton/iconButton';

import { useUserDataContext } from '@/app/userDataContext';
import { AssignmentType, MonthsDataType } from '@/app/typeInterfaces';
import { calculateTotalHoursPerWeek, getCurrentWeekOfYear, getCurrentYear, isBeforeWeek, showMonthAndYear } from '../helpers';
import EditProjectForm from './editProjectForm';

interface ColumnHeaderTitle {
    title: string;
    showIcon: boolean;
}

type CalendarHeaderProps = {
    assignments: AssignmentType[],
    months: MonthsDataType[],
    totalCalculatedInfo?: string,
    avatarUrl?: string,
    title?: string,
    userName?: string,
    editable?: boolean,
    projectInfo?: string
    columnHeaderTitles: ColumnHeaderTitle[]
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    assignments,
    months,
    totalCalculatedInfo,
    avatarUrl,
    title,
    userName,
    editable,
    projectInfo,
    columnHeaderTitles }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { setDateRange } = useUserDataContext();
    const currentWeek = getCurrentWeekOfYear()
    const currentYear = getCurrentYear()
    const totalHoursPerWeek = calculateTotalHoursPerWeek(assignments as AssignmentType[])

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

    return (
        <thead>
            <tr className="pl-4 border-bottom actionbar min-h-28 text-white flex">
                <th className="px-0 flex w-1/3">
                    {true ? (
                        <EditProjectForm avatarUrl={avatarUrl || ''} userName={userName || ''} onClose={() => setIsEditing(!isEditing)} />
                    ) : (
                        <div className='flex text-white items-center'>
                            {avatarUrl && (
                                <div className="px-2 py-2 relative overflow-hidden w-[92px] h-[67px]">
                                    <Image
                                        src={avatarUrl}
                                        fill
                                        sizes="(max-width: 640px) 80px, (max-width: 768px) 92px, 92px"
                                        className='rounded-lg'
                                        alt='Avatar'
                                    />
                                </div>
                            )}
                            <div className='flex flex-col items-start'>
                                <div className='flex align-start'>
                                    <div className='text-huge px-3'>{title || userName}</div>
                                    {editable && (
                                        <IconButton
                                            className={'py-1'}
                                            iconSize={'w-4 h-4'}
                                            onClick={() => setIsEditing(true)}
                                            Icon={SlPencil}
                                        />
                                    )}
                                </div>
                                {projectInfo && <p className='px-1 py-1 font-normal'>{projectInfo}</p>}
                            </div>
                        </div>)
                    }
                </th>
                {months?.map((month) => {
                    return month.weeks.map((week) => (
                        <th key={`month-${month.monthLabel}-week-${week}`} className="relative px-1">
                            <ColumnChart height={totalHoursPerWeek[`${month.year}-${week}`]} color={isBeforeWeek(week, currentWeek, currentYear, month) ? '#AEB3C0' : '#27B5B0'} />
                        </th>
                    ));
                })}
                <th className="px-4 py-2 w-1/6">{totalCalculatedInfo}</th>
            </tr>
            <tr className="px-2 flex border-b border-gray-300">
                <th className="pl-1 pr-0 pt-1 pb-2 font-normal align-top text-transparentGrey w-1/3">
                    <div className='flex flex-row justify-between items-start'>
                        {columnHeaderTitles.map((el, i) => {
                            return (
                                <div key={el.title} className='w-24 flex items-center justify-start text-start'>
                                    {el.showIcon && (<PlusIcon className='w-4 h-4' />)}
                                    <span className='pl-1'>{el.title}</span>
                                </div>)
                        })}
                        <IconButton className='pt-2 text-black flex items-center justify-center' onClick={prevQuarter} Icon={ChevronLeftIcon} iconSize={'h6 w-6'} />
                    </div>
                </th>
                {months?.map((month) => {
                    return month.weeks.map((week, index) => (
                        <th key={`${month.monthLabel}-${index}`} className="relative py-2 px-1 font-normal text-contrastBlue">
                            <div className="flex flex-col items-center w-[34px]">
                                <span>{`W${index + 1}`}</span>
                                {index === 0 && <span>{showMonthAndYear(month.year, month.monthLabel)}</span>}
                            </div>
                        </th>

                    ));
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
