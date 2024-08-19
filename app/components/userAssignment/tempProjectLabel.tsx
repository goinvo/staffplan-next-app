import { UPSERT_PROJECT } from "@/app/gqlQueries";
import { AssignmentType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import { useMutation } from "@apollo/client";
import { FormikValues,Formik } from "formik";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

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
	const {userId} = useParams();
	const { refetchProjectList,refetchUserList } = useUserDataContext();
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
		assignments: [{userId: userId}],
	};

	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			refetchProjectList();
			refetchUserList();

		},
	});

	const onSubmitUpsert = (values: FormikValues) => {
		const variables = {
			clientId: values.client,
			name: values.name,
			status: "unconfirmed",
			cost: 0,
			fte: null,
			hours: 0,
			rateType: "fixed",
			assignments: [{userId: userId}],
		};
		upsertProject({
			variables: variables,
		})
	};
	return (
		<div className="hover:cursor-pointer w-40 absolute left-10 mt-5 overflow-hidden">
			<div className=" flex w-12 h-12 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${assignment.project.client.avatarUrl}`}
					alt="client avatar"
					width={500}
					height={500}
				/>
			</div>
			<div className="hover:cursor-pointer">
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
						<form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
							<div className="flex mb-4 pb-2 justify-between">
							
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
										className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
										placeholder="Enter Project Name"
									/>
							</div>
						</form>
					)}
				</Formik>
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500 text-sm">
					{" "}
					Unconfirmed
					<br /> Assignment
				</div>
			)}
		</div>
	);
};
