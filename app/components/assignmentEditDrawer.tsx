import {
	Formik,
	Field,
	FormikValues,
} from "formik";
import React, { useState } from "react";
import ProjectDatepicker from "./projectDatepicker";
import Select, {
	components,
	DropdownIndicatorProps,
	OptionProps,
} from "react-select";
import { useUserDataContext } from "../userDataContext";
import {
	AssignmentType,
	UserType,
	UserOptionType,
	AssignmentEditDrawerProps,
} from "../typeInterfaces";
import Image from "next/image";
import { UPSERT_ASSIGNMENT } from "../gqlQueries";
import { useMutation } from "@apollo/client";
import { LoadingSpinner } from "./loadingSpinner";
import { DateTime } from "luxon";

const DropdownIndicator = (props: DropdownIndicatorProps<UserOptionType>) => {
	return (
		<components.DropdownIndicator {...props}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				className="w-6 h-6 stroke-accentgreen stroke-1"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m19.5 8.25-7.5 7.5-7.5-7.5"
				/>
			</svg>
		</components.DropdownIndicator>
	);
};

export const AssignmentEditDrawer = ({
	assignment,
}: AssignmentEditDrawerProps) => {
	const [confirmed, setConfirmed] = useState(
		assignment.status === "active" ? true : false
	);
	const [selectedOption, setSelectedOption] = useState<{
		value: string;
		label: string;
		avatarUrl: string;
	}>({ value: "", label: "Assign To...", avatarUrl: "" });
	const { userList, setUserList, refetchUserList } = useUserDataContext();
	const numberOfWeeks = (assignment: AssignmentType) => {
		if (assignment.endsOn && assignment.startsOn) {
			const currEndsOn = DateTime.fromISO(assignment.endsOn);
			const currStartsOn = DateTime.fromISO(assignment.startsOn);
			return Math.ceil(currEndsOn.diff(currStartsOn, "weeks").weeks);
		}
		return 0;
	};
	const initialValues = {
		assignmentId: assignment.id,
		dates: { endsOn: assignment.endsOn, startsOn: assignment.startsOn },
		hoursPerWeek: assignment.estimatedWeeklyHours,
		totalHours: numberOfWeeks(assignment)
			? numberOfWeeks(assignment) * assignment.estimatedWeeklyHours
			: 0,
		userId: "",
		numOfWeeks: numberOfWeeks(assignment),
		status: assignment.status === "active" ? true : false,
	};

	const listOfUsers = () => {
		return userList.map((user: UserType) => {
			return {
				values: user.id,
				label: user.name,
				key: user.id,
				avatarUrl: user.avatarUrl,
			};
		});
	};

	const { Option } = components;
	const IconOption = (props: OptionProps<UserOptionType>) => {
		return (
			<Option {...props}>
				<span className="flex pl-1">
					<Image
						className="rounded-full overflow-hidden hover:cursor-pointer mr-2"
						src={props.data.avatarUrl}
						width={24}
						height={24}
						alt={props.data.label}
					/>
					{props.data.label}
				</span>
			</Option>
		);
	};

	const handleUserChange = (
		selectedOption: any,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		if (selectedOption.values) {
			setFieldValue("userId", parseInt(selectedOption.values));
			// setValues({ ...values, userId: parseInt(selectedOption.values) });
			return setSelectedOption(selectedOption);
		}
	};

	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT);
	if (!userList || mutationLoading) return <LoadingSpinner />;
	const onSubmitUpsert = ({
		userId,
		dates,
		status,
		hoursPerWeek,
	}: FormikValues) => {
		upsertAssignment({
			variables: {
				id: assignment.id,
				projectId: assignment.project.id,
				userId: userId,
				status: status ? "active" : "proposed",
				startsOn: dates.startsOn,
				endsOn: dates.endsOn,
				estimatedWeeklyHours: hoursPerWeek,
			},
		}).then((response) => {
			if (response.data.upsertAssignment) {
				refetchUserList();
			}
		});
	};
	const handleHoursPerWeekChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		values: FormikValues,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		const numOfWeeks = values.numOfWeeks;
		const hoursPerWeek = e.target.value;
		const totalHours = numOfWeeks * parseInt(hoursPerWeek);
		setFieldValue("totalHours", totalHours);
	};
	return (
		<div className="w-auto flex">
			<Formik
				onSubmit={(e) => {
					onSubmitUpsert(e);
				}}
				initialValues={initialValues}
				// validate={validateForm}
			>
				{({
					errors,
					handleBlur,
					handleChange,
					handleSubmit,
					isValid,
					setErrors,
					setFieldValue,
					touched,
					values,
					resetForm,
				}) => (
					<form onSubmit={handleSubmit} className="mx-auto flex-grow px-2">
						<div className="flex justify-between mr-10 pr-10 w-3/4">
							<div className="mr-4 mt-5" style={{ width: "200px" }}>
								{/* Toggle label */}
								<label className="ml-3 inline pl-[0.15rem] hover:cursor-pointer text-gray-900 px-2 py-2 text-sm flex items-center">
									<span>
										<Field
											className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
											type="checkbox"
											name="status"
										/>
										{values.status ? "Confirmed" : "Unconfirmed"}
									</span>
								</label>
							</div>
							<div
								className="w-1/4 flex flex-col mr-4"
								style={{ width: "150px" }}
							>
								{/* Hours/Week input */}
								<label
									htmlFor="hours"
									className="block font-medium text-gray-900"
								>
									Hours/Week
								</label>
								<input
									type="number"
									name="hoursPerWeek"
									id="hoursPerWeek"
									min={0}
									autoComplete="hoursPerWeek"
									className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
									placeholder=""
									value={values.hoursPerWeek}
									onChange={(e) => {
										handleChange(e);
										handleHoursPerWeekChange(e, values, setFieldValue);
									}}
									style={{ width: "100%" }}
								/>
							</div>
							<div className="w-auto mr-4 mt-1">
								{/* Project datepicker */}
								<Field
									name="dates"
									selectedAssignment={assignment}
									handleBlur={handleBlur}
									component={ProjectDatepicker}
									assignmentView={true}
								/>
							</div>
							<div className="w-auto flex flex-col mr-4">
								{/* Weeks input */}
								<label className="block font-medium text-gray-900">
									# Weeks
									<input
										type="number"
										min="0"
										max="100"
										step="1"
										name="numOfWeeks"
										id="numOfWeeks"
										autoComplete="numOfWeeks"
										className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
										placeholder="0"
										onBlur={handleBlur}
										onChange={(e) => {
											handleChange(e);
										}}
										value={values.numOfWeeks}
									/>
								</label>
							</div>
							<div className="w-auto">
								{/* Total hours input */}
								<label
									htmlFor="hours"
									className="block font-medium text-gray-900"
								>
									Total Hours
								</label>
								<input
									type="number"
									name="totalHours"
									id="totalHours"
									min={0}
									readOnly={true}
									autoComplete="totalHours"
									className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
									placeholder=""
									value={values.totalHours}
									onChange={(e) => {
										handleChange(e);
									}}
								/>
							</div>
						</div>
						{/* Section 2 */}
						<div className="flex mb-4 justify-between">
							<div className={"w-1/3"}>
								<Select
									placeholder={"Assign To..."}
									value={selectedOption}
									onChange={(e) => {
										handleUserChange(e, setFieldValue);
									}}
									options={listOfUsers()}
									components={{ DropdownIndicator, Option: IconOption }}
									defaultValue={selectedOption}
									menuPlacement="auto"
									unstyled
									classNames={{
										input: () => "[&_input:focus]:ring-0 text-accent w-1/3",
										control: () =>
											"w-1/3 p-2 border border-accentgreen rounded-md text-accentgreen",
										menu: () =>
											"bg-white border border-accentgreen rounded-md w-1/3",
										option: () => `hover:cursor-pointer
												py-2 w-full`,
									}}
								/>
							</div>
							<div className="mr-2 flex justify-end">
								<button
									type="button"
									className={`rounded-md px-3 py-2 text-sm font-semibold border border-1 border-accentgreen text-accentgreen shadow-sm hover:bg-accentgreen hover:text-white mr-2`}
									onClick={() => {
										resetForm();
										setErrors({});
									}}
								>
									Discard Changes
								</button>
								<button
									type="submit"
									disabled={!isValid}
									className={`rounded-md bg-${
										isValid ? "accentgreen" : "slate-500"
									} px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accentgreen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accentgreen`}
								>
									Accept
								</button>
							</div>
						</div>
					</form>
				)}
			</Formik>
		</div>
	);
};
