"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback, useRef } from "react";
import withApollo from "@/lib/withApollo";

import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { ProjectType, UserType, AssignmentType } from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { useUserDataContext } from "@/app/userDataContext";
import { sortSingleProject } from "@/app/helperFunctions";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { ProjectAssignmentRow } from "@/app/components/projectAssignment/projectAssignmentRow";
import { DateTime } from "luxon";

const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
		null
	);
	const [projectAssignments, setProjectAssignments] = useState<
		AssignmentType[]
	>([]);
	const inputRefs = useRef<
		Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>
	>([]);
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT, {
		onCompleted({ upsertAssignment }) {
			refetchUserList();
			refetchProjectList();
		},
	});
	const {
		userList,
		projectList,
		viewsFilter,
		setSingleProjectPage,
		refetchProjectList,
		refetchUserList,
	} = useUserDataContext();

	const addNewAssignmentRow = useCallback(async () => {
		const variables = {
			projectId: selectedProjectId,
			userId: "",
			status: "proposed",
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
				setSelectedProject(foundProject);
			}

			if (!userList || userList.length === 0) return;
			const sortedAssignments = viewsFilter.showArchivedAssignments
				? sortSingleProject(
						viewsFilter.singleProjectSort,
						selectedProject?.assignments || []
				  )
				: sortSingleProject(
						viewsFilter.singleProjectSort,
						selectedProject?.assignments?.filter(
							(assignment: AssignmentType) => assignment.status !== "archived"
						) || []
				  );
				  
				setProjectAssignments(sortedAssignments);
		}
	}, [
		projectList,
		userList,
		selectedProjectId,
		viewsFilter.singleProjectSort,
		viewsFilter.showArchivedAssignments,
		setSingleProjectPage,
	]);

	const selectedProjectDates = () => {
		const startDate = selectedProject?.startsOn
			? DateTime.fromISO(selectedProject.startsOn)
			: null;
		const endDate = selectedProject?.endsOn
			? DateTime.fromISO(selectedProject.endsOn)
			: null;

		if (!startDate || !endDate) {
			return "Start Date - End Date";
		}
		const formattedStartDate = startDate.toFormat("d.MMM");
		const formattedEndDate = endDate.toFormat("d.MMM");
		const startYear = startDate.year;
		const endYear = endDate.year;
		if (startYear === endYear) {
			return `${formattedStartDate}-${formattedEndDate}.${endYear}`;
		} else {
			return `${formattedStartDate}.${startYear}-${formattedEndDate} ${endYear}`;
		}
	};

	const columnHeaderTitles = [
		{ title: "People", showIcon: true, onClick: () => addNewAssignmentRow() },
	];

	const projectInfoSubtitle = `${selectedProject?.client.name}, budget, ${
		selectedProject?.hours || 0
	}h, ${selectedProjectDates()}`;

	return (
		<>
			{selectedProject && projectList && projectAssignments ? (
				<>
					<ScrollingCalendar
						columnHeaderTitles={columnHeaderTitles}
						title={selectedProject.name}
						projectInfo={projectInfoSubtitle}
						assignments={projectAssignments || []}
						editable={true}
					>
						{projectAssignments.map((assignment: AssignmentType, rowIndex) => {
							return (
								<ProjectAssignmentRow
									project={selectedProject}
									key={`${assignment.id}-${rowIndex}`}
									assignment={assignment}
									monthData={{ monthLabel: "", year: 0 }}
									isFirstMonth={true}
									isLastMonth={true}
									rowIndex={rowIndex}
									totalRows={selectedProject?.assignments?.length || 0}
									inputRefs={inputRefs}
								/>
							);
						})}
					</ScrollingCalendar>
				</>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default withApollo(ProjectPage);
