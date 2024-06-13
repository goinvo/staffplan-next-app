"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { useMutation } from "@apollo/client";
import {
	ProjectType,
	UserType,
	AssignmentType,
} from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { useUserDataContext } from "@/app/userDataContext";
import { sortSingleProject } from "@/app/helperFunctions";
import { ScrollingCalendar } from "@/app/components/weekDisplayPrototype/scrollingCalendar";
import { ProjectAssignmentRow } from "@/app/components/projectAssignmentPrototype/projectAssignmentRow";
import AddAssignmentSingleProject from "@/app/components/addAssignmentSIngleProject";
import { PlusIcon } from "@heroicons/react/24/solid";
import ProjectDetails from "@/app/components/projectDetails";

const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
		null
	);
	const [usersWithProjectAssignment, setUsersWithProjectAssignment] = useState<
		UserType[]
	>([]);

	const {
		userList,
		projectList,
		viewsFilter,
		setSingleProjectPage,
		refetchProjectList,
	} = useUserDataContext();

	useEffect(() => {
		if (projectList) {
			const foundProject = projectList.find(
				(project: ProjectType) => project.id.toString() === selectedProjectId
			);
			if (foundProject) {
				setSingleProjectPage(foundProject);
				setSelectedProject(foundProject);
			}

			if (!userList) return;

			const newUsersWithProjectAssignment = userList
				.map((user: UserType) => {
					// Filter out assignments that don't match the project name
					const filteredAssignments = user.assignments?.filter((assignment) => {
						return assignment.project.id.toString() === selectedProjectId;
					});
					return {
						...user,
						assignments: filteredAssignments,
					};
				})
				.filter(
					(user: UserType) => user.assignments && user.assignments.length > 0
				);
			const sortedAssignments = sortSingleProject(
				viewsFilter.singleProjectSort,
				newUsersWithProjectAssignment
			);
			setUsersWithProjectAssignment(sortedAssignments);
		}
	}, [projectList, userList]);

	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	return (
		<div>
			{selectedProject && projectList ? (
				<ScrollingCalendar>
					{selectedProject?.assignments?.map(
						(assignment: AssignmentType, index) => {
							return (
								<ProjectAssignmentRow
									key={index}
									assignment={assignment}
									monthData={{ monthLabel: "", year: 0 }}
									isFirstMonth={true}
									isLastMonth={true}
								/>
							);
						}
					)}
				</ScrollingCalendar>
			) : (
				<LoadingSpinner />
			)}
			<div>
				{selectedProject ? (
					<ProjectDetails
						project={selectedProject}
						projectList={projectList}
						refetchProjectList={refetchProjectList}
					/>
				) : (
					<></>
				)}
			</div>
			<div>
				<button
					className="bg-white border-2 border-accentgreen w-8 h-8 ml-2 rounded-full flex justify-center items-center"
					onClick={() => setAddAssignmentVisible(true)}
				>
					<PlusIcon className="fill-accentgreen" />
				</button>
				{addAssignmentVisible && (
					<AddAssignmentSingleProject
						project={selectedProject}
						onClose={onClose}
						onComplete={onComplete}
					/>
				)}
			</div>
		</div>
	);
};

export default withApollo(ProjectPage);
