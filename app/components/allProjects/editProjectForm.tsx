"use client";

import React, { useState, useRef, useEffect } from "react";
import { FormikValues, useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { DateTime } from "luxon";

import { ProjectType, ClientType } from "../../typeInterfaces";
import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";
import { AutocompleteInput } from "../autocompleteInput";
import { useClientDataContext } from "@/app/contexts/clientContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import CustomDateInput from "../customDateInput";
import { ARCHIVED_PROJECT_WARNING } from "../constants/archivedStatusStrings";

interface EditFormProps {
	onClose?: () => void;
}

const EditProjectForm: React.FC<EditFormProps> = ({ onClose }) => {
	const { refetchClientList, clientList } = useClientDataContext()

	const {
		projectList,
		refetchProjectList,
	} = useProjectsDataContext();
	const { showArchivedProjects } = useGeneralDataContext()
	const params = useParams();
	const router = useRouter();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const selectedProject = projectList.find(
		(project: ProjectType) => project.id.toString() === selectedProjectId
	);
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (!values.clientName) errors.clientName = "Client is required";
		if (!values.projectName) errors.projectName = "Project name is required";

		const currentClient = clientList.find((client: ClientType) => client.name === values.clientName);
		if (values.projectName && currentClient) {
			const projectNameExists = projectList.find(
				(project: ProjectType) =>
					project.name === values.projectName &&
					currentClient.id === project.client.id &&
					project.id.toString() !== selectedProjectId.toString()
			);
			if (projectNameExists) {
				errors.projectName = "Project name already in use";
			}
		}

		return errors;
	}

	const {
		name,
		startsOn,
		endsOn,
		hours,
		client: { name: clientName, id: clientId },
		id,
		status,
		rateType,
		hourlyRate,
		cost,
	} = selectedProject as ProjectType;
	const [archivedStatus, setArchivedStatus] = useState(status === "archived");
	const [showTooltip, setShowTooltip] = useState(false);
	const [previousStatus] = useState(status);
	const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);
	const clientInputRef = useRef<HTMLInputElement>(null);

	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			refetchProjectList();
			if (archivedStatus && !showArchivedProjects) {
				router.push("/projects");
			}
		},
	});
	const [
		upsertClient,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_CLIENT, {
		errorPolicy: "all",
		onCompleted({ upsertClient }) {
			refetchClientList();
		},
	});

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	const startsOnDefaultValue = startsOn || DateTime.now().toISODate()
	const endsOnDateDefaultValue = DateTime.fromISO(startsOnDefaultValue).plus({ months: 3 }).toISODate()
	const formik = useFormik({
		initialValues: {
			projectName: name || "",
			clientName: clientName || "",
			clientId: clientId,
			budget: "",
			hours: hours,
			startsOn: startsOnDefaultValue || '',
			endsOn: endsOn || endsOnDateDefaultValue || '',
			projectStatus: status,
			rateType: rateType ? rateType : "fixed",
			hourlyRate: hourlyRate && hourlyRate > 0 ? hourlyRate : 0,
			cost: cost,
		},
		validate: validateForm,
		onSubmit: async (values) => {
			let clientId = clientList?.find(
				(client) =>
					client.name.toLowerCase() === values.clientName.toLowerCase()
			)?.id;

			if (!clientId) {
				const { data } = await upsertClient({
					variables: { name: values.clientName },
				});
				clientId = data?.upsertClient?.id;
			}
			const variables = {
				id: id,
				clientId: clientId,
				name: values.projectName,
				hours: +values.hours,
				...(values.startsOn && { startsOn: values.startsOn }),
				...(values.endsOn && { endsOn: values.endsOn }),
				status: values.projectStatus,
				rateType: values.rateType,
				hourlyRate: values.hourlyRate,
				cost: values.cost,
			};
			await upsertProject({
				variables,
			});

			onClose?.();
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (formik.dirty) {
			formik.handleSubmit();
		} else {
			onClose?.();
		}
	};

	const handleArchiveButtonClick = () => {
		setArchivedStatus(!archivedStatus);
		const newStatus = !archivedStatus
			? "archived"
			: previousStatus !== "archived"
				? previousStatus
				: "unconfirmed";
		formik.setFieldValue("projectStatus", newStatus, false);
		if (!archivedStatus) {
			setShowTooltip(true);
			setTimeout(() => setShowTooltip(false), 8000);
		}
	};

	const handleClientSelect = (client: ClientType) => {
		formik.setFieldValue("clientName", client.name);
	};

	const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		formik.handleChange(e);
	};

	const handleClientBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		formik.handleBlur(e);
		const inputValue = e.target.value;
		if (inputValue) {
			const existedClient = clientList?.find(
				({ name }: ClientType) => name === inputValue
			);
			if (!existedClient) {
				setShowNewClientModal(true);
			}
		}
	};

	const handleNewClientCancel = () => {
		setShowNewClientModal(false);

		if (clientInputRef?.current) {
			clientInputRef?.current.focus();
		}
	};
	// temporary commented
	// const setTotalCost = (
	// 	event: React.ChangeEvent<HTMLInputElement>,
	// 	values: FormikValues,
	// 	setFieldValue: <ValueType = FormikValues>(
	// 		field: string,
	// 		value: ValueType,
	// 		shouldValidate?: boolean
	// 	) => void
	// ) => {
	// 	if (values.rateType === "hourly") {
	// 		setFieldValue("cost", parseInt(event.target.value) * values.hours);
	// 	}
	// };
	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col space-y-2 my-2 text-contrastBlue w-full pr-2"
		>
			<div className="flex flex-col justify-start pl-1 w-full">
				<input
					type="text"
					name="projectName"
					value={formik.values.projectName}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					className="h-10 px-2 rounded-sm shadow-top-input-shadow focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-huge w-full"
					placeholder="Project Name"
				/>
				{formik.touched.projectName && formik.errors.projectName ? (
					<p className="pl-2 text-2xs text-left font-normal text-red-500">{formik.errors.projectName}</p>
				) : null}
			</div>
			<div className="flex flex-col items-start space-x-0.5 w-full pl-2">
				<div className="flex items-center w-full space-x-1 flex-grow">
					<label
						htmlFor="clientName"
						className="text-white font-normal text-tiny min-w-12 text-left"
					>
						Client
					</label>
					<AutocompleteInput
						ref={clientInputRef}
						items={clientList}
						inputName="clientName"
						value={formik.values.clientName}
						onItemSelect={handleClientSelect}
						onChange={handleClientChange}
						onBlur={handleClientBlur}
						inputClassName="h-6 flex-grow w-full pl-1 py-0 rounded-sm font-normal text-tiny"
						dropdownClassName="font-normal rounded-sm"
						displayKey="name"
						placeholder="Client"
					/>
				</div>
				{formik.touched.clientName && formik.errors.clientName ? (
					<p className="pl-14 text-2xs text-left font-normal text-red-500">{formik.errors.clientName}</p>
				) : null}
			</div>
			<div className="flex items-center space-x-0.5 w-full pl-2">
				<div className="flex items-center flex-grow space-x-1">
					<label
						htmlFor="budget"
						className="text-white font-normal text-tiny min-w-12 text-left"
					>
						Budget
					</label>
					<input
						type="text"
						name="budget"
						value={formik.values.budget}
						disabled={true} // Temporary disabled for future integration.
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						id="budget"
						className="h-6 w-full pl-1 max-w-[115px] shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outline-none"
						placeholder="$USD"
					/>
					{formik.touched.budget && formik.errors.budget ? (
						<p className="text-red-500">{formik.errors.budget}</p>
					) : null}
				</div>
				<div className="flex items-center flex-grow space-x-1">
					<label
						htmlFor="hours"
						className="text-white font-normal text-tiny min-w-12 text-left pl-1"
					>
						Hours
					</label>
					<input
						type="text"
						name="hours"
						value={formik.values.hours}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						id="hours"
						className="h-6 w-full pl-1 max-w-[115px] shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outline-none"
						placeholder="Hours"
					/>

					{formik.touched.hours && formik.errors.hours ? (
						<p className="text-red-500">{formik.errors.hours}</p>
					) : null}
				</div>
			</div>
			<div className="flex items-center space-x-0.5 w-full pl-2">
				<div className="flex items-center flex-grow space-x-1">
					<label
						htmlFor="startsOn"
						className="text-white font-normal text-tiny min-w-12 text-left"
					>
						Starts
					</label>
					<div className="max-w-[115px]">
						<CustomDateInput
							name="startsOn"
							errorString="Invalid start date format. Please use dd.MMM.yy."
							value={formik.values.startsOn}
							onChange={(value) => formik.setFieldValue("startsOn", value)}
							onBlur={() => formik.setFieldTouched("startsOn", true)}
							setError={(error) => formik.setFieldError("startsOn", error)}
						/>
					</div>

				</div>
				<div className="flex items-center space-x-1 flex-grow">
					<label
						htmlFor="endsOn"
						className="text-white font-normal text-tiny min-w-12 text-left pl-1"
					>
						Ends
					</label>
					<div className="max-w-[115px]">
						<CustomDateInput
							name="endsOn"
							errorString="Invalid end date format. Please use dd.MMM.yy."
							value={formik.values.endsOn}
							onChange={(value) => formik.setFieldValue("endsOn", value)}
							onBlur={() => formik.setFieldTouched("endsOn", true)}
							setError={(error) => {
								formik.setFieldError("endsOn", error);
							}}
						/>
					</div>
				</div>
			</div>
			{formik.errors.endsOn && <p className="pl-2 text-2xs text-left font-normal text-red-500">{formik.errors.endsOn}</p>}
			{formik.errors.startsOn && <p className="pl-2 text-2xs text-left font-normal text-red-500">{formik.errors.startsOn}</p>}
			<div className="flex items-center justify-between space-x-8 w-full pl-2 border-t border-grey-700 py-2">
				<div className="relative flex items-center">
					<span
						className={`py-2 text-tiny font-normal rounded-sm underline text-left  ${archivedStatus ? "text-tiffany" : "text-white"
							} cursor-pointer`}
						onClick={handleArchiveButtonClick}
					>
						Archive
					</span>
					{showTooltip && (
						<div className="absolute top-full mt-2 bg-gray-700 text-white text-xs font-normal rounded px-4 py-2 z-10 shadow-lg w-[300px]">
							{ARCHIVED_PROJECT_WARNING}
						</div>
					)}
				</div>
				<div className="flex w-full space-x-4">
					<button
						className={`sm:w-1/2 md:w-1/3 py-2 text-tiny text-center bg-contrastGrey rounded-sm text-white hover:bg-accentgreen`}
						onClick={() => onClose?.()}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!formik.isValid}
						className={`sm:w-1/2 md:w-2/3 py-2 text-tiny text-center bg-tiffany hover:bg-accentgreen rounded-sm text-white`}
					>
						Done
					</button>
				</div>
			</div>
			{
				showNewClientModal && (
					<div className="fixed inset-0 font-normal bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
						<div className="bg-white p-6 rounded-md shadow-md">
							<p className="mb-4">
								Is &quot;{formik.values.clientName}&quot; a new client?
							</p>
							<div className="flex justify-center">
								<button
									className="mr-2 px-4 py-2 text-tiny font-bold bg-tiffany hover:bg-accentgreen rounded-sm text-white"
									onClick={() => setShowNewClientModal(false)}
								>
									Yes
								</button>
								<button
									className="px-4 py-2 text-tiny font-bold bg-contrastGrey hover:bg-contrastBlue rounded-sm text-white"
									onClick={() => handleNewClientCancel()}
								>
									No
								</button>
							</div>
						</div>
					</div>
				)
			}
		</form >
	);
};

export default EditProjectForm;

// temporary commented
{/* <div className="flex flex-row justify-between mb-4 pb-2 border-b-4">
				<div className="w-1/3 -mr-1 flex flex-col">
					<div className="block flex items-center">
						<input
							type="radio"
							name="rateType"
							value="fixed"
							id="fixed"
							checked={formik.values.rateType === "fixed"}
							onChange={() => {
								formik.setFieldValue("rateType", "fixed");
								formik.setFieldValue("hourlyRate", 0);
								formik.setFieldValue("cost", 0);
							}}
							className="form-radio text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent mr-2"
						/>
						<label className="text-white font-normal text-tiny">Fixed Rate</label>
					</div>
					<div className="block flex items-center">
						<input
							type="radio"
							name="rateType"
							value="hourly"
							id="hourly"
							checked={formik.values.rateType === "hourly"}
							onChange={() => {
								formik.setFieldValue("rateType", "hourly");
								formik.setFieldValue("cost", 0);
							}}
							className="form-radio text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent mr-2"
						/>
						<label className="text-white font-normal text-tiny">Hourly Rate</label>
					</div>
				</div>

				<div className="w-1/2 flex justify-end items-center">
					<label className='pr-2 text-white font-normal text-tiny w-[75px] text-right'>
						<span className="relative">
							<input
								disabled={
									formik.values.rateType === "fixed" ||
									formik.values.hours === 0
								}
								type="number"
								min="0"
								value={formik.values.hourlyRate}
								name="hourlyRate"
								id="hourlyRate"
								autoComplete="hourlyRate"
								onBlur={formik.handleBlur}
								onChange={(e) => {
									formik.handleChange(e);
									setTotalCost(e, formik.values, formik.setFieldValue);
								}}
								className={
									formik.values.rateType === "fixed"
										? "bg-slate-500 h-6 px-2 shadow-top-input-shadow text-tiny text-black font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[50px]"
										: "h-6 px-2 text-black shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[60px]"
								}
								placeholder="0"
							/>
						</span>
						Rate($/hr)
					</label>
					<label className='pr-2 text-white font-normal text-tiny w-[55px] text-right'>
						<span className="relative">
							<input
								disabled={formik.values.rateType === "hourly"}
								type="number"
								min="0"
								name="cost"
								value={formik.values.cost}
								id="cost"
								autoComplete="cost"
								onBlur={formik.handleBlur}
								onChange={(e) => {
									formik.handleChange(e);
									setTotalCost(e, formik.values, formik.setFieldValue);
								}}
								className="h-6 px-2 shadow-top-input-shadow text-tiny text-black font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[60px]"
								placeholder="0"
							/>
						</span>
						Value(k$)
					</label>
				</div>
				<div>
				</div>
			</div> */}