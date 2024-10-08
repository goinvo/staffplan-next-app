"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useCallback, useRef } from "react";
import withApollo from "@/lib/withApollo";

import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { ProjectType, AssignmentType } from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { ProjectAssignmentRow } from "@/app/components/projectAssignment/projectAssignmentRow";
import { DateTime } from "luxon";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";


const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const inputRefs = useRef<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>([]);
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT, {
		onCompleted({ upsertAssignment }) {
			refetchUserList()
			refetchProjectList()
		}
	});

	const { refetchUserList } = useUserDataContext()
	const {
		projectList,
		sortedSingleProjectAssignments,
		singleProjectPage,
		setSingleProjectPage,
		refetchProjectList,
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

	const selectedProjectDates = () => {
		const startDate = singleProjectPage?.startsOn ? DateTime.fromISO(singleProjectPage.startsOn) : null;
		const endDate = singleProjectPage?.endsOn ? DateTime.fromISO(singleProjectPage.endsOn) : null;

		if (!startDate || !endDate) {
			return 'Start Date - End Date';
		}
		const formattedStartDate = startDate.toFormat('d.MMM');
		const formattedEndDate = endDate.toFormat('d.MMM');
		const startYear = startDate.year;
		const endYear = endDate.year;
		if (startYear === endYear) {
			return `${formattedStartDate}-${formattedEndDate}.${endYear}`;
		} else {
			return `${formattedStartDate}.${startYear}-${formattedEndDate} ${endYear}`;
		}
	}

	const columnHeaderTitles = [{ title: 'People', showIcon: true, onClick: () => addNewAssignmentRow() }]

	const projectInfoSubtitle = `${singleProjectPage?.client.name}, budget, ${singleProjectPage?.hours || 0}h, ${selectedProjectDates()}`
	return (
		<>
			{singleProjectPage && projectList.length ? (
				<>
					<ScrollingCalendar columnHeaderTitles={columnHeaderTitles} title={singleProjectPage.name} projectInfo={projectInfoSubtitle} assignments={sortedSingleProjectAssignments || []} editable={true}>
						{sortedSingleProjectAssignments?.map((assignment: AssignmentType, rowIndex) => {
							return (
								<ProjectAssignmentRow
									project={singleProjectPage}
									key={`${assignment.id}-${rowIndex}`}
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