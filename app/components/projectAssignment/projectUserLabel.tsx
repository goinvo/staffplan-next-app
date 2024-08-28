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
		<td className='pl-2 pr-0 pt-1 pb-2 font-normal flex align-center w-1/3'>
			<div
				className='flex flex-row justify-between items-start'
			>
				<div className="w-48 pl-1 font-bold flex text-contrastBlue w-full">
					<div className="py-2 relative overflow-hidden w-[38px] h-[28px]">
						<Image
							src={`${isUserTBD
								? "http://www.gravatar.com/avatar/newavatar"
								: assignment.assignedUser.avatarUrl
								}`}
							className="rounded-md"
							alt="user avatar"
							fill
							sizes="(max-width: 640px) 28px, (max-width: 768px) 38px, 38px"
						/>
					</div>
					<div className="flex flex-col items-center justify-center">
						{!isUserTBD &&
							(<button className="px-2" onClick={() => clickHandler(assignment)}>
								{assignment.assignedUser.name}
							</button>)}
						{isUserTBD && (
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
									<form className="w-30 px-2" onSubmit={handleSubmit}>
										{/* SECTION 1 */}
										<Field
											onChange={handleChange}
											onBlur={handleSubmit}
											as="select"
											name="userId"
											id="userId"
											className="border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm pr-0"
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

									</form>
								)}
							</Formik>
						)}
						<div>
							{assignment.status !== 'active' &&
								(
									<span className="px-2 text-red-500 font-normal">
										Unconfirmed
									</span>
								)}
						</div>
					</div>
				</div>
			</div>
			<div className='text-contrastBlue flex flex-col space-y-3 ml-auto px-2'>
				<div className='pt-2 underline'>
					Signed
				</div>
				<div className='pt-2'>
					Actual
				</div>
			</div>
		</td >
	);
};