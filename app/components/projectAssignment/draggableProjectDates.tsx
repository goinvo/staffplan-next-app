'use client'

import React, { DragEvent, FC } from 'react';
import { useMutation } from "@apollo/client";
import { UPSERT_PROJECT } from "@/app/gqlQueries";
import { useProjectsDataContext } from '@/app/contexts/projectsDataContext';
import { getISODateFromWeek, getWeekNumberAndYear } from '../scrollingCalendar/helpers';
import { PROJECT_DATES_TYPE } from '../scrollingCalendar/constants';

interface DraggableDatesProps {
    weekNumberOfTheYear: number;
    monthYear: number;
    monthLabel: string;
}

const DraggableDates: FC<DraggableDatesProps> = ({
    weekNumberOfTheYear,
    monthYear,
    monthLabel,
}) => {
    const { projectList, setProjectList, singleProjectPage } = useProjectsDataContext()
    let endDateWeekNumber;
    let startDateWeekNumber;

    if (singleProjectPage?.endsOn) {
        endDateWeekNumber = getWeekNumberAndYear(singleProjectPage?.endsOn)
    }
    if (singleProjectPage?.startsOn) {
        startDateWeekNumber = getWeekNumberAndYear(singleProjectPage?.startsOn)
    }
    const isEndDateWeek = endDateWeekNumber?.weekNumber === weekNumberOfTheYear && monthYear === endDateWeekNumber?.year
    const isStartDateWeek = startDateWeekNumber?.weekNumber === weekNumberOfTheYear && monthYear === startDateWeekNumber?.year

    const [upsertProject] = useMutation(UPSERT_PROJECT, {
        errorPolicy: "all",
        onCompleted({ upsertProject }) {
            const { id, endsOn, startsOn } = upsertProject
            const updatedProjectList = projectList.map(project =>
                project.id === id
                    ? { ...project, endsOn, startsOn }
                    : project
            );
            setProjectList(updatedProjectList)
        },
    });

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        const type = isStartDateWeek ? PROJECT_DATES_TYPE.STARTS_ON : PROJECT_DATES_TYPE.ENDS_ON
        e.dataTransfer.setData('text/plain', JSON.stringify(type));
        e.stopPropagation();
        e.currentTarget.style.zIndex = '100';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        const typeDate = JSON.parse(e.dataTransfer.getData('text/plain'));
        const newTargetDate = getISODateFromWeek(monthYear, weekNumberOfTheYear, Number(monthLabel))
        const newDateForComparison = new Date(newTargetDate)
        e.preventDefault();
        e.currentTarget.style.zIndex = '';
        e.currentTarget.style.opacity = '1';
        if (typeDate === PROJECT_DATES_TYPE.ENDS_ON && singleProjectPage?.startsOn) {
            const startDate = new Date(singleProjectPage.startsOn);
            if (startDate >= newDateForComparison) return;

        }
        if (typeDate === PROJECT_DATES_TYPE.STARTS_ON && singleProjectPage?.endsOn) {
            const endDate = new Date(singleProjectPage.endsOn)
            if (newDateForComparison >= endDate) return;
        }
        const variables = {
            id: singleProjectPage?.id,
            name: singleProjectPage?.name,
            [typeDate]: newTargetDate
        }
        await upsertProject({
            variables
        });

    };

    const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.zIndex = '';
        e.currentTarget.style.opacity = '1';
    };

    const isEndDateWeekStyles = "enddate-stripes"
    const projectDatesStyles = "cursor-pointer navbar"

    return (
        <div
            draggable={isStartDateWeek || isEndDateWeek}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`absolute top-0 left-0 right-0 inset-0 flex flex-col leading-none h-full w-full 
                ${isStartDateWeek || isEndDateWeek ? projectDatesStyles : ''} 
                ${isEndDateWeek ? isEndDateWeekStyles : ''}`}
        >
            <span className='text-contrastGrey text-2xs px-1 pt-1 font-normal'>{isStartDateWeek && 'START' || isEndDateWeek && 'END'}</span>
        </div>
    );
};

export default DraggableDates;
