'use client'

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import clsx from 'clsx';

import { useUserDataContext } from '@/app/userDataContext';
import CalendarHeader from './components/calendarHeader';
import { userData } from '../mockData';
import {
    UserType,
} from "../../../typeInterfaces";
import { getMonthsWithWeeks } from '../../scrollingCalendar/helpers';
import { calculateTotalHoursForAssignment } from './helpers';
import IconButton from '../iconButton/iconButton';
import { PlusIcon } from "@heroicons/react/24/outline";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";


type ScrollingCalendarProps = {
    selectedUser: UserType
}
export interface MonthsDataTest {
    monthLabel: string; year: number; weeks: number[]
}

const ScrollingCalendar = ({ selectedUser }: ScrollingCalendarProps) => {
    const { dateRange } = useUserDataContext();
    const [months, setMonths] = useState<MonthsDataTest[]>([]);
    const assignments = userData
    // const { assignments } = selectedUser
    // console.log(selectedUser.assignments, 'selected user')


    useEffect(() => {
        const startOfQuarter = DateTime.local(dateRange.year, 3 * (dateRange.quarter - 1) + 1, 1);
        const endOfQuarter = DateTime.local(dateRange.year, 3 * dateRange.quarter, 1).endOf('month');
        const monthsData = getMonthsWithWeeks(startOfQuarter.toISO(), endOfQuarter.toISO())
        setMonths(monthsData)

    }, [dateRange]);

    return (
        <table className="min-w-full timeline-grid-bg text-contrastBlue text-sm">
            <CalendarHeader selectedUser={selectedUser} months={months} />
            <tbody>
                {assignments.map((assignment, index) => (
                    <tr key={index} className="px-2 flex border-b border-gray-300 hover:bg-hoverGrey">
                        <td className='pl-2 pr-0 pt-1 pb-2 font-normal align-top w-1/3 flex-none'>
                            <div className='flex flex-row justify-between items-start'>
                                <IconButton
                                    className={'text-contrastBlue w-24 flex items-center justify-center'}
                                    Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.client.name}
                                    onClick={() => console.log('Plus client click')} />
                                <button className='w-24 pl-4 font-bold flex items-center justify-center text-contrastBlue'>
                                    Project
                                </button>
                                <div className='text-contrastBlue flex flex-col space-y-3 pr-2'>
                                    <div className='pt-1 underline'>
                                        Signed
                                    </div>
                                    <div className='pt-2'>
                                        Actual
                                    </div>
                                </div>
                            </div>
                        </td>
                        {months?.map((month) => {
                            return month.weeks.map((week) => (
                                <td key={`${month.monthLabel}-${week}`} className="relative px-1 py-1 font-normal">
                                    <div className='flex flex-col space-y-3'>
                                        <div className='bg-white py-1 text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] flex items-center justify-center'>
                                            {assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
                                        </div>
                                        <div className='bg-white text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] flex items-center justify-center'>
                                            {assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
                                        </div>
                                    </div>
                                </td>
                            ));
                        })}
                        <td className=" font-normal py-2 w-1/6 flex-none">
                            <div className='flex flex-row justify-between pl-4'>
                                <div className='space-y-4'>
                                    <div className='flex flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
                                    <div className='flex flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
                                </div>
                                <IconButton className='pr-6 text-black flex items-center justify-center text-transparentGrey'
                                    onClick={() => console.log('test')}
                                    Icon={ArchiveBoxIcon}
                                    iconSize={'h6 w-6'} />
                            </div>
                        </td>
                    </tr>
                ))
                }
            </tbody >
        </table >

    );
};

export default ScrollingCalendar;


// TO DO: reduce for grouped by client

// const groupedByClient = assignments.reduce((acc: any, curr: any) => {
//     const clientId = curr.client.id;


//     if (!acc[clientId]) {
//         acc[clientId] = {
//             client: curr.client,
//             assignments: [],
//         };
//     }


//     acc[clientId].assignments.push(curr);

//     return acc;
// }, {});


// const result = Object.values(groupedByClient);

// console.log(result);


//     return (
//         <table className="min-w-full timeline-grid-bg text-contrastBlue text-sm">
//             <CalendarHeader selectedUser={selectedUser} months={months} />
//             <tbody>
//                 {assignments.map((assignment, index) => (
//                     <tr key={index} className="px-2 flex border-b border-gray-300 hover:bg-hoverGrey">
//                         <td className='pl-2 pr-0 pt-1 pb-2 font-normal align-top w-1/3 flex-none'>
//                             <div className='flex flex-row justify-between items-start'>
//                                 <IconButton
//                                     className={'text-contrastBlue w-24 flex items-center justify-center'}
//                                     Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.client.name}
//                                     onClick={() => console.log('Plus client click')} />
//                                 <button className='w-24 pl-4 font-bold flex items-center justify-center text-contrastBlue'>
//                                     Project
//                                 </button>
//                                 <div className='text-contrastBlue flex flex-col space-y-3 pr-2'>
//                                     <div className='pt-1 underline'>
//                                         {assignment.status}
//                                     </div>
//                                     <div className='pt-2'>
//                                         {assignment.status}
//                                     </div>
//                                 </div>
//                             </div>
//                         </td>
//                         {months?.map((month) => {
//                             return month.weeks.map((week) => (
//                                 <td key={`${month.monthLabel}-${week}`} className="relative px-1 py-1 font-normal">
//                                     <div className='flex flex-col space-y-3'>
//                                         <div className='bg-white py-1 text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] flex items-center justify-center'>
//                                             {assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
//                                         </div>
//                                         <div className='bg-white text-center rounded-sm shadow-top-shadow w-[34px] h-[25px] flex items-center justify-center'>
//                                             {assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
//                                         </div>
//                                     </div>
//                                 </td>
//                             ));
//                         })}
//                         <td className=" font-normal py-2 w-1/6 flex-none">
//                             <div className='flex flex-row justify-between pl-4'>
//                                 <div className='space-y-4'>
//                                     <div className='flex flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
//                                     <div className='flex flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
//                                 </div>
//                                 <IconButton className='pr-6 text-black flex items-center justify-center text-transparentGrey'
//                                     onClick={() => console.log('test')}
//                                     Icon={ArchiveBoxIcon}
//                                     iconSize={'h6 w-6'} />
//                             </div>
//                         </td>
//                     </tr>
//                 ))
//                 }
//             </tbody >
//         </table >

//     );
// };

// export default ScrollingCalendar;

