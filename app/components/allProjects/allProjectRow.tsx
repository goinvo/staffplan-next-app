'use client'

import {
	ProjectType,
	AllProjectRowProps,
	MonthsDataType,
	AssignmentType,
} from "@/app/typeInterfaces";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { AllProjectLabel } from "./allProjectLabel";
import ProjectSummary from "../projectSummary";
import ColumnChart from "../columnChart";
import { calculateTotalHoursPerWeek, isBeforeWeek, currentWeek, currentYear } from "../scrollingCalendar/helpers";
import { UNDO_ARCHIVED_PROJECT_SUBTITLE, UNDO_ARCHIVED_PROJECT_TITLE } from "../constants/undoModifyStrings";
import UndoRow from "../undoRow";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useFadeInOutRow } from "@/app/hooks/useFadeInOutRow";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { UPSERT_PROJECT_WITH_INPUT } from "@/app/gqlQueries";

export const AllProjectRow = ({
	project,
	projects,
	rowIndex,
	isFirstMonth,
	isLastMonth,
	months,
}: AllProjectRowProps) => {
	const router = useRouter();
	const rowRef = useRef<HTMLTableRowElement>(null!);
	const undoRowRef = useRef<HTMLTableRowElement>(null!);
	const [showUndoRow, setShowUndoRow] = useState<boolean>(false);
	const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } =
		calculateTotalHoursPerWeek(project.assignments as AssignmentType[], months as MonthsDataType[]);

	const { sortBy, newProjectId, projectsWithUndoActions, setNewProjectId, undoModifyProject, refetchProjectList } = useProjectsDataContext()
	const { isFirstShowArchivedProjects, isFirstHideArchivedProjects } = useGeneralDataContext();
	const { animateRow } = useFadeInOutRow({ rowRef, setShowUndoRow, maxHeight: 102 });

	const isNewClient = projects?.[rowIndex - 1]?.client?.id !== project.client.id

	const [upsertProjectWithInput] = useMutation(UPSERT_PROJECT_WITH_INPUT, {
			errorPolicy: "all",
			onCompleted({ upsertProjectWithInput }) {
				refetchProjectList();
			},
	});

	const isModifiedProject = (projectId: number) =>
		projectsWithUndoActions.some((item) => item.project.id === projectId);
	const handleProjectChange = (project: ProjectType) => {
		if (project.id) {
			router.push("/projects/" + encodeURIComponent(project.id));
		}
	};
	const hasActualHoursForWeek = (year: number, week: number) => {
		return !!totalActualHours[`${year}-${week}`];
	};
	const handleUndoModifyProject = () => {
		undoModifyProject(project.id)
		setShowUndoRow(false)
		setTimeout(() => animateRow(false), 10);
	}

	const handleUnarchiveProject = async (project: ProjectType) => {
    const input = {
      id: project.id,
      name: project.name,
      clientId: project.client.id,
      status: "unconfirmed",
    };
    await upsertProjectWithInput({ variables: { input } });
  };

	useEffect(() => {
		if (isModifiedProject(project.id)) {
			animateRow(true);
		}
	}, [projectsWithUndoActions, project.id]);

	useEffect(() => {
    if (newProjectId) {
      setTimeout(() => {setNewProjectId(null)}, 1000)
		}
	}, [newProjectId]);

	if (showUndoRow && isModifiedProject(project.id)) {

		return (
			<tr ref={undoRowRef} className="flex justify-center" key={`undo-${project.id}`}>
				<UndoRow onClick={handleUndoModifyProject} title={UNDO_ARCHIVED_PROJECT_TITLE} subtitle={UNDO_ARCHIVED_PROJECT_SUBTITLE} />
			</tr>)
	}

	return (
		<tr ref={rowRef} key={`project-${project.id}`} className={`pl-5 flex sm:justify-normal justify-between opacity-100 h-auto border-gray-300 hover:bg-hoverGrey ${project.status === 'proposed' ? 'bg-diagonal-stripes' : ''}
			delay-100 ${ (newProjectId === Number(project.id) || (isFirstShowArchivedProjects && project.status === 'archived')) ? 'animate-fadeInScale' : ''}
			${isFirstHideArchivedProjects && project.status === 'archived' ? 'animate-fadeOutScale' : ''}
			${(isNewClient && sortBy === 'Clients' && rowIndex !== 0 || (sortBy === 'Projects' && rowIndex !== 0)) ? 'border-t' : ''}
			${rowIndex === projects.length - 1 ? 'border-b' : ''} `}>
			<td className='sm:block flex items-center pt-1 pb-2 px-0 font-normal align-top w-1/2 sm:w-2/5'>
				{isFirstMonth && (
					<AllProjectLabel
            undoRowRef={undoRowRef}
						isNewClient={isNewClient}
            clickHandler={handleProjectChange}
            project={project}
            handleUnarchiveProject={handleUnarchiveProject}
          />

				)}
			</td>
			{
				months?.map((month: MonthsDataType) => (
					month.weeks.map((week) => {
						const isCurrenWeek = currentWeek === week.weekNumberOfTheYear && currentYear === month.year
						return (
							<td key={`${month.monthLabel}-${week.weekNumberOfTheYear}`} className={`relative px-1 py-1 min-h-[100px] ${isCurrenWeek ? 'bg-selectedColumnBg font-bold' : ''}`}>
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
							</td>)
					})
				))
			}

			{
				isLastMonth && (
					<ProjectSummary project={project} />
				)
			}
		</tr >
	);
};
