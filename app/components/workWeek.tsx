"use client";
import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { DateTime } from "luxon";
import { Formik } from "formik";
export interface WorkweekType {
	id?: number;
	actualHours?: number;
	estimatedHours?: number;
	assignmentId: number;
	cweek: number;
	year: number;
}
interface WorkWeekProps {
	workWeek: WorkweekType;
}
interface UpsertValues {
	actualHours: number | string;
	estimatedHours: number | string;
	assignmentId: number;
	cweek: number;
	year: number;
}

export const WorkWeek = ({ workWeek }: WorkWeekProps) => {
	const [isEditing, setIsEditing] = useState<Boolean>(false);
	const UPSERT_WORKWEEK = gql`
		mutation UpsertWorkWeek(
			$assignmentId: ID!
			$cweek: Int!
			$year: Int!
			$estHours: Int
			$actHours: Int
		) {
			upsertWorkWeek(
				assignmentId: $assignmentId
				cweek: $cweek
				year: $year
				estimatedHours: $estHours
				actualHours: $actHours
			) {
				id
				assignmentId
				estimatedHours
				actualHours
				year
				cweek
			}
		}
	`;

	const initialValues = {
		actualHours: workWeek.actualHours || "",
		estimatedHours: workWeek.estimatedHours || "",
		assignmentId: workWeek.assignmentId,
		cweek: workWeek.cweek,
		year: workWeek.year,
	};

	const [
		upsertWorkweek,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_WORKWEEK, {
		onCompleted(mutationData) {
			console.log(mutationData, "DATADATA");
		},
	});

	const onSubmitUpsert = (values: UpsertValues) => {
		upsertWorkweek({
			variables: {
				assignmentId: values.assignmentId,
				cweek: values.cweek,
				year: values.year,
				estHours: values.estimatedHours,
				actHours: values.actualHours,
			},
		});
		setIsEditing(false);
	};

	if (mutationLoading) return <p> LOADING WORK WEEKS</p>;
	if (mutationError) return <p>ERROR ADJUSTING TIME</p>;
	const workWeekDate = (weekYear: number, weekNumber: number) => {
		return DateTime.fromObject({ weekYear, weekNumber }).toLocaleString();
	};

	return (
		<div className="p-1">
			<div className="border-5 pb-3" key={`workweek ${workWeek.assignmentId}`}>
				{workWeek ? (
					<p>
						Week of: {workWeekDate(initialValues.year, initialValues.cweek)}
					</p>
				) : (
					""
				)}
				<Formik
					onSubmit={(values, actions) => onSubmitUpsert(values)}
					initialValues={initialValues}
				>
					{({ handleSubmit, handleChange, dirty, values, resetForm }) => (
						<form onSubmit={handleSubmit}>
							<div>
								<label>Estimated Hours:</label>
								<input
									disabled={!isEditing}
									className={!isEditing ? "bg-gray-300" : ""}
									id="estimatedHours"
									name="estimatedHours"
									type="number"
									min="0"
									onChange={handleChange}
									value={values.estimatedHours}
								/>
							</div>
							<div>
								<label>Actual Hours:</label>
								<input
									disabled={!isEditing}
									className={!isEditing ? "bg-gray-300 mb-1" : "mb-1"}
									id="actualHours"
									name="actualHours"
									type="number"
									min="0"
									onChange={handleChange}
									value={values.actualHours}
								/>
							</div>
							{isEditing ? (
								<div>
									<button
										type="button"
										onClick={() => {
											setIsEditing(false);
											resetForm();
										}}
										className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										Cancel
									</button>
									<button
										disabled={!dirty}
										type="submit"
										className={
											dirty
												? "ml-5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
												: "ml-5 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
										}
									>
										Save Hours
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setIsEditing(true)}
									className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
								>
									Edit Hours
								</button>
							)}
						</form>
					)}
				</Formik>
			</div>
		</div>
	);
};
