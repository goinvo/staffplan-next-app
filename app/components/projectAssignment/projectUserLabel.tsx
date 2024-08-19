import Image from "next/image";
import React from "react";
import { UserLabelProps, UserType } from "@/app/typeInterfaces";
import { Field, Formik, FormikValues } from "formik";
import { useUserDataContext } from "@/app/userDataContext";
import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "@/app/gqlQueries";

export const ProjectUserLabel = ({
	project,
	assignment,
	clickHandler,
}: UserLabelProps) => {
	const isUserTBD = assignment.assignedUser === null;
	const { userList, refetchUserList } = useUserDataContext();
	const initialValues = {
		id: assignment.id,
		userId: "",
	};
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT);
	const onSubmitUpsert = ({ userId }: FormikValues) => {
		const variables = {
			id: assignment.id,
			userId: userId,
			projectId: project ? project.id : "",
			status: "proposed",
		};
		upsertAssignment({
			variables: variables,
		}).then((response) => {
			if (response.data.upsertAssignment) {
				refetchUserList();
			}
		});
	};
	return (
		<div
			className="hover:cursor-pointer z-10 w-40 absolute left-0"
			onClick={() => (isUserTBD ? "TBD" : clickHandler(assignment))}
		>
			<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${
						isUserTBD
							? "http://www.gravatar.com/avatar/newavatar"
							: assignment.assignedUser.avatarUrl
					}`}
					alt="user avatar"
					width={500}
					height={500}
				/>
			</div>
			<div
				className="hover:cursor-pointer"
				onClick={() => (isUserTBD ? null : clickHandler(assignment))}
			>
				{isUserTBD ? (
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
						}) => (
							<form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
								{/* SECTION 1 */}
								<div className="flex mb-4 pb-2 border-b-4">
									<div className="w-1/2 mr-4 flex flex-col">
										<Field
											onChange={handleChange}
											onBlur={handleSubmit}
											as="select"
											name="userId"
											id="userId"
											className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
										>
											{[
												<option key="TBD" value="">
													TBD
												</option>,
												...userList?.map((user: UserType) => (
													<option
														key={`${user.id} + ${user.name}`}
														value={user.id}
													>
														{user.name}
													</option>
												)),
											]}
											``
										</Field>
									</div>
								</div>
							</form>
						)}
					</Formik>
				) : (
					assignment.assignedUser.name
				)}
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500"> Unconfirmed</div>
			)}
		</div>
	);
};
