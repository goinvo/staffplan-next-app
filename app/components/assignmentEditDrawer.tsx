import { Formik, Field } from "formik";
import React, { useState } from "react";
import ProjectDatepicker from "./projectDatepicker";
import Select, { components, DropdownIndicatorProps } from "react-select";
import { useUserDataContext } from "../userDataContext";
import { UserType } from "../typeInterfaces";

interface UserOptionType {
	value: string;
	label: string;
}

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

export const AssignmentEditDrawer = () => {
	const [confirmed, setConfirmed] = useState(false);
	const [selectedOption, setSelectedOption] = useState<{
		value: string;
		label: string;
	}>({ value: "", label: "Assign To..." });
	const { userList } = useUserDataContext();
	const initialValues = {
		client: "",
		cost: 0,
		dates: { endsOn: "", startsOn: "" },
		flatRate: 0,
		hourlyRate: 0,
		hoursPerWeek: 0,
		totalHours: 0,
		name: "",
		numOfWeeks: "",
		payRate: "flatRate",
		status: false,
	};

	const listOfUsers = () => {
		return userList.map((user: UserType) => {
			return { values: user.id, label: user.name };
		});
	};

	const handleUserChange = (selectedOption: any) => {
		if (selectedOption.value) {
			return setSelectedOption(selectedOption);
		}
	};
	return (
		<div>
			<Formik
				onSubmit={(e) => {
					// onSubmitUpsert(e);
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
					<form onSubmit={handleSubmit} className="max-w-lg mx-auto flex-grow">
						{/* Section 1 */}
						<div className="flex">
							<div className="mr-4 mt-12">
								<label className="ml-3 inline pl-[0.15rem] hover:cursor-pointer text-gray-900 px-4 py-2 text-sm">
									<input
										className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
										type="checkbox"
										name="status"
										checked={confirmed}
										onChange={(e) => {
											setConfirmed(!confirmed);
											// onSubmitUpsert(e);
										}}
									/>
									{confirmed ? "Confirmed" : "Unconfirmed"}
								</label>
							</div>
							<div className="w-1/4 flex flex-col mr-4 mt-6">
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
									min={1}
									autoComplete="hoursPerWeek"
									className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
									placeholder=""
									value={values.hoursPerWeek}
									onChange={(e) => {
										handleChange(e);
										// handleManualHours(e, values, setFieldValue);
									}}
									readOnly={values.dates.endsOn ? true : false}
								/>
							</div>
							<div className="w-auto mr-4 mt-7">
								<Field
									name="dates"
									handleBlur={handleBlur}
									component={ProjectDatepicker}
									assignmentView={true}
								/>
							</div>
							<div className="w-auto flex flex-col mr-4">
								<label className="block font-medium text-gray-900">
									# Weeks
									<input
										type="number"
										min="1"
										max="100"
										step="1"
										name="numOfWeeks"
										id="numOfWeeks"
										autoComplete="numOfWeeks"
										className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
										placeholder="1"
										onBlur={handleBlur}
										onChange={(e) => {
											handleChange(e);
										}}
										value={values.numOfWeeks}
									/>
								</label>
							</div>
							<div className="w-auto">
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
									min={1}
									readOnly={true}
									autoComplete="totalHours"
									className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
									placeholder=""
									value={values.totalHours}
									onChange={(e) => {
										handleChange(e);
										// handleManualHours(e, values, setFieldValue);
									}}
								/>
							</div>
						</div>
						{/* Section 2 */}
						<div className="flex mb-4 justify-between">
							<div className={""}>
								<Select
									placeholder={"Assign To..."}
									value={selectedOption}
									onChange={handleUserChange}
									options={listOfUsers()}
									components={{ DropdownIndicator }}
									defaultValue={selectedOption}
									theme={(theme) => {
										return {
											...theme,
											borderRadius: 5,
											width: "100%",
											colors: {
												...theme.colors,
												primary25: "#02AAA4",
												primary: "#02AAA4",
											},
										};
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
