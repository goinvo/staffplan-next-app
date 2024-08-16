import Image from 'next/image';
import { SlPencil } from "react-icons/sl";
import { DateTime } from 'luxon';
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import ColumnChart from '../../columnChart/columnChart';
import IconButton from '../../iconButton/iconButton';
import { PlusIcon } from "@heroicons/react/24/outline";
import { useUserDataContext } from '@/app/userDataContext';
import { calculateTotalHours } from '../helpers';
import { AssignmentType, MonthsDataType, UserType } from '@/app/typeInterfaces';
import { userData } from '../../mockData';

type CalendarHeaderProps = {
    selectedUser: UserType,
    months: MonthsDataType[],
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ selectedUser, months }) => {
    const { setDateRange } = useUserDataContext();

    // const { assignments } = selectedUser
    const assignments = userData
    const totalHoursPerWeek = calculateTotalHours(assignments as AssignmentType[])
    // console.log(assignments, 'assignments from header')

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
            <tr className="px-4 border-bottom actionbar text-white flex">
                <th className="px-0 py-2 w-1/3 flex-none">
                    <div className='flex flex-row text-white items-center'>
                        <div className="px-0 py-2">
                            <Image src={selectedUser?.avatarUrl}
                                width={92}
                                height={67}
                                className='rounded-lg'
                                alt='User photo' />
                        </div>
                        <div className='text-huge px-2'>{selectedUser?.name}</div>
                        <IconButton className='flex items-center justify-center' onClick={() => console.log()} Icon={SlPencil} />
                    </div>
                </th>
                {months?.map((month) => {
                    return month.weeks.map((week) => (
                        <th key={week} className="relative px-1">
                            <div className='flex flex-col items-center w-[34px]'>
                                <ColumnChart height={totalHoursPerWeek[week]} />
                            </div>
                        </th>
                    ));
                })}
                <th className="px-4 py-2 w-1/6 flex-none"></th>
            </tr>

            <tr className="px-2 flex border-b border-gray-300">
                <th className="pl-0 pr-0 pt-1 pb-2 font-normal align-top text-transparentGrey w-1/3 flex-none">
                    <div className='flex flex-row justify-between item-start'>
                        <IconButton
                            className={'w-24 flex items-center justify-center'}
                            Icon={PlusIcon} iconSize='h-4 w-4' text={'Client'}
                            onClick={() => console.log('Plus client click')} />
                        <button className='w-24 pr-2 flex items-center justify-center'>
                            Project
                        </button>
                        <IconButton className='pt-2 text-black flex items-center justify-center' onClick={prevQuarter} Icon={ChevronLeftIcon} iconSize={'h6 w-6'} />
                    </div>

                </th>
                {months?.map((month) => {
                    return month.weeks.map((week, index) => (
                        <th key={`${month.monthLabel}-${index}`} className="relative py-2 px-1 font-normal text-contrastBlue">
                            <div className="flex flex-col items-center w-[34px]">
                                <span>{`W${index + 1}`}</span>
                                {index === 0 && <>{DateTime.local(month.year, parseInt(month.monthLabel), 1).toFormat('MMM')}</>}
                            </div>
                        </th>

                    ));
                })}
                <th className="pl-0 pr-4 pt-1 pb-2 font-normal align-top w-1/6 flex-none">
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

