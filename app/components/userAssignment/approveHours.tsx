'use client';

import React from "react";
import { MonthsDataType } from "@/app/typeInterfaces";
import Image from "next/image";

import { calculateTotalHoursForApprove } from "../scrollingCalendar/helpers";
import { useUserDataContext } from "@/app/contexts/userDataContext";

import TurnTHePhone from '../../components/assets/turnThePhone.png'


type ApproveHoursProps = {
    months?: MonthsDataType[]
}

const ApproveHours: React.FC<ApproveHoursProps> = ({ months }) => {
    const { singleUserPage } = useUserDataContext()

    const getWorkedHoursForApprovePerOneWeek = (months?: MonthsDataType[]) => {
        if (!months || !months.length) return;
        if (!singleUserPage) return;
        const totalHoursForApprove = calculateTotalHoursForApprove(singleUserPage?.assignments!, months)
        const oneWeek = months[0]
        const { year } = oneWeek
        const { weeks } = oneWeek
        const targetWeeks = weeks[0]
        return totalHoursForApprove[`${year}-${targetWeeks.weekNumberOfTheYear}`]
    }


    const hoursPerWeek = getWorkedHoursForApprovePerOneWeek(months)

    return (
        <tr className={`px-5 sm:hidden flex border-b border-gray-300 hover:bg-hoverGrey min-h-[100px]`}>
            <td className='my-5 px-2 font-normal w-full'>
                <button
                    className='w-full h-10 text-tiny bg-tiffany rounded-sm text-white pt-1 mb-4 mt-2'
                >
                    Yes, I worked <b>{hoursPerWeek}</b> hrs
                </button>
                <div className="px-2 py-2 flex flex-col items-center">
                    <span>I need to see the full plan.</span>
                    <Image
                        src={TurnTHePhone}
                        className="my-2 rounded-md bg-red-300 object-cover"
                        alt="Turn the phone"
                        width={104}
                        height={88}
                    />
                </div>
            </td>
        </tr>
    );
};


export default ApproveHours;