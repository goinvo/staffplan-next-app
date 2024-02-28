"use client";
import React, { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { DateTime, Interval,Duration } from "luxon";
import { useFormik } from "formik";
export interface WorkweekType {
    workWeek:{
        id: number;
        actualHours: number;
        estimatedHours: number;
        assignmentId: number;
        cweek: number;
        year: number;
    }
}

export const WorkWeek = ({ workWeek }:WorkweekType) => {
	const [workWeekValues, setWorkWeekValues] = useState<WorkweekType["workWeek"]>({
		id: workWeek.id,
		actualHours: workWeek.actualHours,
		estimatedHours: workWeek.estimatedHours,
		assignmentId: workWeek.assignmentId,
		cweek: workWeek.cweek,
		year: workWeek.year,
	});

	useEffect(() => {
		setWorkWeekValues(workWeek);
	}, [workWeek]);

	const formik = useFormik({
		initialValues: {
		id: workWeek.id,
		actualHours: workWeek.actualHours,
		estimatedHours: workWeek.estimatedHours,
		assignmentId: workWeek.assignmentId,
		cweek: workWeek.cweek,
		year: workWeek.year,
		},
		onSubmit: (values) => {
			alert(JSON.stringify(values, null, 2));
			upsertWorkweek({
				variables: {
					assignmentId: values.assignmentId,
					cweek: values.cweek,
					year: values.year,
					estHours: values.estimatedHours,
					actHours: values.actualHours,
				},
			});
		},
	});

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
			}
		}
	`;

	const workWeekDate = (weekYear: number, weekNumber: number) =>
		DateTime.fromObject({ weekYear, weekNumber }).toLocaleString();

	const [
		upsertWorkweek,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_WORKWEEK);
	if (mutationLoading) return <p> LOADING WORK WEEKS</p>;
	if (mutationError) return <p>ERROR ADJUSTING TIME</p>;

    // const testInt = Interval.fromDateTimes(DateTime.fromISO("2024-02-14"),DateTime.fromISO("2024-03-01"))
    // const testArr = testInt.splitBy(Duration.fromObject({weeks:1}))

    // testArr.map((int) => {
    //     console.log(workWeekDate(int.end?.toFormat("kkkk"),int.start?.toFormat("W")))
    //     return workWeekDate(int.end?.toFormat("kkkk"),int.start?.toFormat("W"),)
    // })
    
	return (
		<div>
			<div className="border-5 pb-3" key={`workweek ${workWeek.assignmentId}`}>
				{workWeek ? (
					<p>Week of: {workWeekDate(workWeek.year, workWeek.cweek)}</p>
				) : (
					""
				)}
				<form onSubmit={formik.handleSubmit}>
					<div>
						<label>Calendar Week:</label>
						<input
							id="cweek"
							name="cweek"
                            type="number"
							onChange={formik.handleChange}
							value={formik.values.cweek}
						/>
					</div>
					<div>
						<label>Calendar Year:</label>
						<input
							id="year"
							name="year"
                            type="number"
							onChange={formik.handleChange}
							value={formik.values.year}
						/>
					</div>
					<div>
						<label>Estimated Hours:</label>
						<input
							id="estimatedHours"
							name="estimatedHours"
                            type="number"
							onChange={formik.handleChange}
							value={formik.values.estimatedHours}
						/>
					</div>
					<div>
						<label>Actual Hours:</label>
						<input
							id="actualHours"
							name="actualHours"
                            type="number"
							onChange={formik.handleChange}
							value={formik.values.actualHours}
						/>
					</div>
					<button
						type="submit"
						className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Edit Hours
					</button>
				</form>
			</div>
		</div>
	);
};
