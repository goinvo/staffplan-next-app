'use client';

import React from "react";
import { MonthsDataType, AssignmentType } from "@/app/typeInterfaces";

import { calculateTotalHoursPerWeek, getWeeksPerScreen, isBeforeWeek } from "../scrollingCalendar/helpers";
import { useUserDataContext } from "@/app/contexts/userDataContext";

import ColumnChart from "../columnChart";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import useDynamicWeeks from "@/app/hooks/useDynamicWeeks";


type ColumnChartsRowProps = {
    months?: MonthsDataType[],
}

const ColumnChartsRow: React.FC<ColumnChartsRowProps> = ({ months }) => {
    const { singleUserPage } = useUserDataContext()
    const { dateRange } = useGeneralDataContext()
    const weeksCount = useDynamicWeeks({
        baseWidth: 70,
        baseWeeksCount: 0,
        pixelsPerWeek: 42
    });
    const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } =
        calculateTotalHoursPerWeek(singleUserPage?.assignments as AssignmentType[], months as MonthsDataType[]);
    const hasActualHoursForWeek = (year: number, week: number) => {
        return !!totalActualHours[`${year}-${week}`];
    };

    const monthsForCharts = getWeeksPerScreen(dateRange, weeksCount)


    return (
        <tr className={`sm:hidden flex border-b border-gray-300 hover:bg-hoverGrey min-h-[100px]`}>
            <td className="flex flex-row">
                {
                    monthsForCharts?.map((month: MonthsDataType) => (
                        month.weeks.map((week) => {
                            return (
                                <div key={`${month.monthLabel}-${week.weekNumberOfTheYear}`} className={`relative py-1 mx-1 max-w-[34px] min-h-[100px]`}>
                                    <ColumnChart
                                        hasActualHoursForWeek={hasActualHoursForWeek(month.year, week.weekNumberOfTheYear)}
                                        height={
                                            hasActualHoursForWeek(month.year, week.weekNumberOfTheYear)
                                                ? totalActualHours[`${month.year}-${week.weekNumberOfTheYear}`]
                                                : totalEstimatedHours[`${month.year}-${week.weekNumberOfTheYear}`]
                                        }
                                        proposedHours={proposedEstimatedHours[`${month.year}-${week.weekNumberOfTheYear}`]}
                                        maxValue={maxTotalHours}
                                        textColor="contrastBlue"
                                        isBeforeWeek={isBeforeWeek(week.weekNumberOfTheYear, month)}
                                    />
                                </div>

                            )
                        })
                    ))
                }
            </td>
        </tr>
    );
};


export default ColumnChartsRow;