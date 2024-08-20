'use client'

import React from 'react';

import { calculateTotalHoursForAssignment } from '../helpers';
import IconButton from '../../iconButton/iconButton';
import { PlusIcon } from "@heroicons/react/24/outline";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import CustomInput from '../../customInput/CustomInput';
import { AssignmentType, MonthsDataType } from '@/app/typeInterfaces';

interface CalendarBodyProps {
    assignments: AssignmentType[]
    months: MonthsDataType[]
}

const CalendarBody: React.FC<CalendarBodyProps> = ({ assignments, months }) => {
    return (
        <tbody>
            {assignments.map((assignment, index) => (
                <tr key={index} className="px-2 flex border-b border-gray-300 hover:bg-hoverGrey">
                    <td className='pl-2 pr-0 pt-1 pb-2 font-normal align-top w-1/3'>
                        <div className='flex flex-row justify-between items-start'>
                            <IconButton
                                className={'text-contrastBlue w-24 flex items-center justify-center pt-2'}
                                Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.client.name}
                                onClick={() => console.log('Plus client click')} />
                            <button className='w-24 pl-4 pt-2 font-bold flex items-center justify-center text-contrastBlue'>
                                Project
                            </button>
                            <div className='text-contrastBlue flex flex-col space-y-3 pr-2'>
                                <div className='pt-2 underline'>
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
                                <div className='flex flex-col space-y-3 font-normal'>
                                    <CustomInput
                                        value={assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
                                        onChange={(e) => console.log(e)} />
                                    <CustomInput
                                        value={assignment.workWeeks.find(w => w.cweek === week)?.actualHours || 0}
                                        onChange={(e) => console.log(e)} />
                                </div>
                            </td>
                        ));
                    })}
                    <td className=" font-normal py-2 w-1/6">
                        <div className='flex flex-row justify-between pl-4'>
                            <div className='space-y-4'>
                                <div className='flex pt-1 flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
                                <div className='flex pt-1 flex-start items-center align-center'>{calculateTotalHoursForAssignment(assignment)}</div>
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
    )
}

export default CalendarBody