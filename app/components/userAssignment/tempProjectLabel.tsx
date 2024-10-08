import React from "react";
import { useMutation } from "@apollo/client";
import { FormikValues, Formik } from "formik";
import { useParams } from "next/navigation";

import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { UPSERT_PROJECT } from "@/app/gqlQueries";
import { AssignmentType } from "@/app/typeInterfaces";



interface TempLabelProps {
	assignment: AssignmentType;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TempProjectLabel = ({
	assignment,
	tempProjectOpen,
	setTempProjectOpen,
}: TempLabelProps) => {
	const { userId } = useParams();

	const { refetchUserList } = useUserDataContext()

	const { refetchProjectList } = useProjectsDataContext();
	const initialValues = {
		client: assignment.project.client.id,
		cost: 0,
		dates: { endsOn: "", startsOn: "" },
		hourlyRate: 0,
		hours: 0,
		name: "",
		numOfFTE: 0,
		rateType: "fixed",
		status: false,
		assignments: [{ userId: userId }],
	};

	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			refetchProjectList();
			refetchUserList();

		},
	});

	const onSubmitUpsert = (values: FormikValues) => {
		if (!values.name) return;
		const variables = {
			clientId: values.client,
			name: values.name,
			status: "unconfirmed",
			cost: 0,
			fte: null,
			hours: 0,
			rateType: "fixed",
			assignments: [{ userId: userId }],
		};
		upsertProject({
			variables: variables,
		})
	};

	return (
		<div className="w-24 pl-4 pt-2">
			<Formik
				onSubmit={(e) => onSubmitUpsert(e)}
				initialValues={initialValues}
			>
				{({
					handleChange,
					values,
					setErrors,
					handleSubmit,
					handleBlur,
					errors,
					touched,
					isValid,
				}) => (
					<form onSubmit={handleSubmit}>
						<input
							autoComplete="off"
							id="projectName"
							name="name"
							value={values.name}
							onBlur={(e) => {
								handleBlur(e)
								handleSubmit()
							}}
							onChange={(e) => {
								handleChange(e);
							}}
							className="max-w-[150px] px-2 h-7 rounded-md shadow-sm focus:ring-tiffany focus:border-tiffany font-bold text-tiny text-contrastBlue"
							placeholder="Project Name"
						/>
					</form>
				)}
			</Formik>
		</div >
	);
};
