"use client";

import React, { useState, useRef, useEffect } from "react";
import { FormikValues, useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";

import { IoCheckmarkCircle } from "react-icons/io5";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

import IconButton from "../iconButton";
import { ProjectType, ClientType } from "../../typeInterfaces";
import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";
import { AutocompleteInput } from "../autocompleteInput";
import { useClientDataContext } from "@/app/contexts/clientContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";

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

	const formik = useFormik({
		initialValues: {
			projectName: name || "",
			clientName: clientName || "",
			clientId: clientId,
			budget: "",
			hours: hours,
			startsOn: startsOn || "",
			endsOn: endsOn || "",
			projectStatus: status,
			rateType: rateType ? rateType : "fixed",
			hourlyRate: hourlyRate && hourlyRate > 0 ? hourlyRate : 0,
			cost: cost,
		},
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
		formik.setFieldValue("projectStatus", newStatus);
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
	const setTotalCost = (
		event: React.ChangeEvent<HTMLInputElement>,
		values: FormikValues,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		if (values.rateType === "hourly") {
			setFieldValue("cost", parseInt(event.target.value) * values.hours);
		}
	};
	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col space-y-2 my-2 text-contrastBlue"
		>
			<div className="flex flex-row justify-start pl-1">
				<input
					type="text"
					name="projectName"
					value={formik.values.projectName}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					className="h-10 mr-2 px-2 rounded-sm shadow-top-input-shadow focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-huge max-w-[300px]"
					placeholder="Project Name"
				/>
				{formik.touched.projectName && formik.errors.projectName ? (
					<p className="text-red-500">{formik.errors.projectName}</p>
				) : null}
				<IconButton
					className="text-tiffany"
					type="submit"
					Icon={IoCheckmarkCircle}
					iconSize="h-7 w-7 ml-1"
				/>
			</div>
			<div className="flex flex-row justify-between h-6">
				<div className="relative flex items-center py-0 my-0 w-full">
					<label
						htmlFor="clientName"
						className="pr-2 text-white font-normal text-tiny w-[55px] text-right"
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
						inputClassName="h-6 px-2 py-0 rounded-sm font-normal text-tiny max-w-[100px] w-full"
						dropdownClassName="w-[155px] font-normal rounded-sm"
						displayKey="name"
						placeholder="Client"
					/>
					{formik.touched.clientName && formik.errors.clientName ? (
						<p className="text-red-500 ml-2">{formik.errors.clientName}</p>
					) : null}
				</div>
			</div>
			<div className="flex flex-row justify-between">
				<div className="flex items-center">
					<label
						htmlFor="budget"
						className="pr-2 text-white font-normal text-tiny w-[55px] text-right"
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
						className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
						placeholder="Budget"
					/>
					{formik.touched.budget && formik.errors.budget ? (
						<p className="text-red-500">{formik.errors.budget}</p>
					) : null}
				</div>
				<div className="flex items-center">
					<label
						htmlFor="hours"
						className="pr-2 text-white font-normal text-tiny w-[55px] text-right"
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
						className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
						placeholder="Hours"
					/>
					{formik.touched.hours && formik.errors.hours ? (
						<p className="text-red-500">{formik.errors.hours}</p>
					) : null}
				</div>
			</div>

			<div className="flex flex-row justify-between">
				<div className="flex items-center">
					<label
						htmlFor="startsOn"
						className="pr-2 text-white font-normal text-tiny w-[55px] text-right"
					>
						Starts
					</label>
					<input
						type="date"
						name="startsOn"
						value={formik.values.startsOn}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						id="startsOn"
						className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
						placeholder="Start date"
					/>
					{formik.touched.startsOn && formik.errors.startsOn ? (
						<p className="text-red-500">{formik.errors.startsOn}</p>
					) : null}
				</div>
				<div className="flex items-center">
					<label
						htmlFor="endsOn"
						className="pr-2 text-white font-normal text-tiny w-[55px] text-right"
					>
						Ends
					</label>
					<input
						type="date"
						name="endsOn"
						value={formik.values.endsOn}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						id="endsOn"
						className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
						placeholder="End date"
					/>
					{formik.touched.endsOn && formik.errors.endsOn ? (
						<p className="text-red-500">{formik.errors.endsOn}</p>
					) : null}
				</div>
			</div>
			<div className="flex flex-row justify-between mb-4 pb-2 border-b-4">
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
			</div>
					<button
						className={`mr-2 px-4 py-2 text-tiny font-bold bg-tiffany rounded-sm text-white text-black  ${archivedStatus ? "text-tiffany" : "text-transparentGrey"
							}`}
						onClick={handleArchiveButtonClick}
					>Archive</button>

			{showNewClientModal && (
				<div className="fixed inset-0 font-normal bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
					<div className="bg-white p-6 rounded-md shadow-md">
						<p className="mb-4">
							Is &quot;{formik.values.clientName}&quot; a new client?
						</p>
						<div className="flex justify-center">
							<button
								className="mr-2 px-4 py-2 text-tiny font-bold bg-tiffany rounded-sm text-white"
								onClick={() => setShowNewClientModal(false)}
							>
								Yes
							</button>
							<button
								className="px-4 py-2 text-tiny font-bold bg-contrastGrey rounded-sm text-white"
								onClick={() => handleNewClientCancel()}
							>
								No
							</button>
						</div>
					</div>
				</div>
			)}
		</form>
	);
};

export default EditProjectForm;
