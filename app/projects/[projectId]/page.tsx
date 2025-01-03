"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useCallback, useRef, useState } from "react";
import withApollo from "@/lib/withApollo";
import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { ProjectType, AssignmentType } from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { ProjectAssignmentRow } from "@/app/components/projectAssignment/projectAssignmentRow";
import { DateTime } from "luxon";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { calculatePlanFromToday } from "@/app/components/scrollingCalendar/helpers";
import { SORT_ORDER } from "@/app/components/scrollingCalendar/constants";



const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const inputRefs = useRef<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>([]);

	const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("projectPageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "People", sort: SORT_ORDER.ASC };
    }
  });

	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT, {
		async onCompleted({ upsertAssignment }) {
			if (upsertAssignment) {
				setProjectList((prevProjectList) => {
					return prevProjectList?.map((project) => {
						if (project.id === upsertAssignment?.project?.id) {
							return {
								...project,
								assignments: [
									...(project.assignments || []),
									upsertAssignment,
								],
							};
						}
						return project;
					});
				});
			}
		}
	});

	const {
    projectList,
    sortedSingleProjectAssignments,
    singleProjectPage,
    newAssignedUsersId,
    setSingleProjectPage,
    setProjectList,
    setNewAssignedUsersId,
  } = useProjectsDataContext();

	const addNewAssignmentRow = useCallback(async () => {
		const variables = {
			projectId: selectedProjectId,
			userId: '',
			status: 'proposed',
		};
		upsertAssignment({
			variables,
		});
	}, [selectedProjectId, upsertAssignment]);

	useEffect(() => {
		if (projectList && projectList.length > 0) {
			const foundProject = projectList.find(
				(project: ProjectType) => project.id.toString() === selectedProjectId
			);
			if (foundProject) {
				setSingleProjectPage(foundProject);
			}
		}
	}, [
		projectList,
		selectedProjectId,
		setSingleProjectPage
	]);

	useEffect(() => {
			return () => setNewAssignedUsersId([]);
		}, [])

	const selectedProjectDates = () => {
		const startDate = singleProjectPage?.startsOn ? DateTime.fromISO(singleProjectPage.startsOn) : null;
		const endDate = singleProjectPage?.endsOn ? DateTime.fromISO(singleProjectPage.endsOn) : null;

		if (!startDate && !endDate) {
			return '';
		}
		const formattedStartDate = startDate?.toFormat('d.MMM')
		const formattedEndDate = endDate?.toFormat('d.MMM')
		const startYear = startDate?.year || ''
		const endYear = endDate?.year || ''

		if (startDate && !endDate) {
			return `Starts ${formattedStartDate}.${startYear}`;
		}

		if (!startDate && endDate) {
      return `Ends  ${formattedEndDate}.${endYear}`;
    }

		if (startYear !== endYear) {
			return `${formattedStartDate}.${startYear} — ${formattedEndDate}.${endYear}`
		}

		return `${formattedStartDate} — ${formattedEndDate}.${endYear}`;
	}


	const columnHeaderTitles = [{ title: 'People', showIcon: true, onIconClick: () => addNewAssignmentRow() }]
	const totalPlanPerProject = sortedSingleProjectAssignments?.reduce((total, assignment) => {
		return total + calculatePlanFromToday(assignment);
	}, 0);

	const totalBurnedPerProject = sortedSingleProjectAssignments?.reduce((total, assignment) => {
		return total + assignment.workWeeks.reduce(
			(acc, curr) => acc + (curr.actualHours ?? 0),
			0
		);
	}, 0);

	const getDeltaValue = () => {
		if (!singleProjectPage?.hours) {
			return;
		}
		const delta = totalPlanPerProject + totalBurnedPerProject - singleProjectPage?.hours
		return delta > 0 ? `+${delta}` : `${delta}`;
	}
	const projectSummaryInfo = [
		{ label: 'Target', value: singleProjectPage?.hours, show: !!singleProjectPage?.hours },
		{ label: 'Plan', value: totalPlanPerProject + totalBurnedPerProject, show: true,tooltip: `Plan = Future Plan (${totalPlanPerProject}) + Actual (${totalBurnedPerProject})` },
		{ label: 'Actual', value: totalBurnedPerProject, show: true },
		{ label: 'Delta', value: getDeltaValue(), show: !!singleProjectPage?.hours,
			 tooltip: `Delta = Future Plan (${totalPlanPerProject}) + Actual (${totalBurnedPerProject}) - Target (${singleProjectPage?.hours})` 
			}
	]
	const projectInfoSubtitle = `${singleProjectPage?.client?.name}, ${selectedProjectDates()}`.trimEnd().replace(/,$/, "")
	const projectStatus = singleProjectPage?.status;
	return (
    <>
      {singleProjectPage && projectList.length ? (
        <>
          <ScrollingCalendar
            columnHeaderTitles={columnHeaderTitles}
            title={singleProjectPage.name}
            projectInfo={projectInfoSubtitle}
            projectStatus={projectStatus}
            assignments={sortedSingleProjectAssignments || []}
            editable={true}
            draggableDates={true}
            projectSummaryInfo={projectSummaryInfo}
            initialSorting={initialSorting}
          >
            {sortedSingleProjectAssignments?.map(
              (assignment: AssignmentType, rowIndex) => {
                return (
                  <ProjectAssignmentRow
                    project={singleProjectPage}
                    key={`${assignment.id}`}
                    assignment={assignment}
                    monthData={{ monthLabel: "", year: 0 }}
                    isFirstMonth={true}
                    isLastMonth={true}
                    rowIndex={rowIndex}
                    totalRows={sortedSingleProjectAssignments?.length || 0}
                    inputRefs={inputRefs}
                  />
                );
              }
            )}
          </ScrollingCalendar>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};

export default withApollo(ProjectPage);