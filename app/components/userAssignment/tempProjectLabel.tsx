'use client'

import React, { useMemo } from "react";
import { useMutation } from "@apollo/client";
import { useFormik } from "formik";

import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { UPSERT_PROJECT, UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { AutocompleteInput } from "../autocompleteInput";
import { filterUnassignedProjectsForUser, getClientProjects } from "../scrollingCalendar/helpers";
import { useClientDataContext } from "@/app/contexts/clientContext";

interface TempLabelProps {
	assignment: AssignmentType;
}

interface FormValues {
	clientId: string | number;
	cost: number;
	hours: number;
	name: string;
	fte: number | null;
	rateType: string;
	status: string;
	assignments: { userId: string }[];
}

type UpsertAssignmentVariables = {
	projectId: string,
	userId: string,
	status: string
}

export const TempProjectLabel = ({
	assignment
}: TempLabelProps) => {
	const { refetchUserList, singleUserPage } = useUserDataContext()
	const { clientList, refetchClientList } = useClientDataContext()
	const userId = singleUserPage?.id?.toString() || "";
	const { refetchProjectList } = useProjectsDataContext();
	const initialValues: FormValues = {
		clientId: assignment.project.client.id,
		cost: 0,
		hours: 0,
		name: "",
		fte: null,
		rateType: "fixed",
		status: "unconfirmed",
		assignments: [{ userId: userId }],
	};

	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		async onCompleted({ upsertProject }) {
			try {
				await Promise.all([
					refetchUserList(),
					refetchProjectList()
				]);
			} catch (e: any) {
				throw new Error("Something went wrong", e.message);
			}
		},
	});

	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: 'all',
		async onCompleted() {
			try {
				await Promise.all([
					refetchUserList(),
					refetchClientList(),
					refetchProjectList(),
				]);
			} catch (e: any) {
				throw new Error("Something went wrong", e.message);
			}
		}
	});

	const validateForm = (values: FormValues) => {
		const errors: Partial<Record<keyof FormValues, string | {}>> = {};
		if (!values.name) errors.name = "Project name is required";

		const projectNameExists = singleUserPage?.assignments?.some((assignment: AssignmentType) => assignment?.project.name === values.name);

		if (projectNameExists) {
			errors.name = "Project already in use";
		}
		return errors;
	}

	const formik = useFormik({
		initialValues,
		validate: validateForm,
		onSubmit: async (values: FormValues) => {
			if (!values.name) return;
			const existedProjectInClientList = filteredProjects.find((project) => project.name === values.name);
			if (existedProjectInClientList) {
				const variables = {
					projectId: String(existedProjectInClientList.id),
					userId: String(userId),
					status: 'proposed'
				};
				await addNewAssignmentWithExistingProject(variables);
				return;
			}
			await createNewProject(values)
		}



	});
	const addNewAssignmentWithExistingProject = async (variables: UpsertAssignmentVariables) => {
		await upsertAssignment({
			variables
		});
	};

	const createNewProject = async (variables: FormValues) => {
		await upsertProject({
			variables
		});
	};

	const handleProjectSelect = (project: ProjectType) => {
		formik.setFieldValue("name", project.name);
	};

	const handleProjectBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		formik.handleBlur(e);
		formik.handleSubmit()
	};


	const clientProjects = useMemo(() => {
		return getClientProjects(clientList, assignment.project.client.id);
	}, [clientList, assignment.project.client.id]);

	const filteredProjects = useMemo(() => {
		return filterUnassignedProjectsForUser(clientProjects as ProjectType[], userId);
	}, [clientProjects, userId]);

	return (
		<div className="w-24 mx-auto pt-2">
			<form onSubmit={formik.handleSubmit}>
				<AutocompleteInput
					items={filteredProjects}
					onItemSelect={handleProjectSelect}
					onChange={formik.handleChange}
					onBlur={handleProjectBlur}
					displayKey="name"
					inputName="name"
					placeholder="Project Name"
					value={formik.values.name}
					inputClassName="w-[150px] h-7 rounded-md shadow-sm focus:ring-tiffany focus:border-tiffany font-bold text-tiny text-contrastBlue"
					dropdownClassName="w-[150px] p-2 rounded-sm text-tiny z-30"
					listClassName="p-2 z-34"
				/>
				{formik.touched.name && formik.errors.name ? (
					<p className="text-tiny whitespace-nowrap py-1 text-red-500">{formik.errors.name}</p>
				) : null}
			</form>
		</div>
	);
};
