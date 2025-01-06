"use client";

import React, { useEffect, useState, useRef } from "react";
import {  useRouter } from "next/navigation";
import { useFormik, FormikValues } from "formik";
import { DateTime } from "luxon";
import { useMutation } from "@apollo/client";

import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";
import { ClientType, ProjectType } from "../typeInterfaces";
import { AutocompleteInput } from "./autocompleteInput";
import { useUserDataContext } from "../contexts/userDataContext";
import { useClientDataContext } from "../contexts/clientContext";
import { useGeneralDataContext } from "../contexts/generalContext";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import CustomDateInput from "./customDateInput";

interface NewProjectFormProps {
	closeModal: () => void;
	isModalView: boolean;
}

const NewProjectForm = ({ closeModal, isModalView }: NewProjectFormProps) => {
	const router = useRouter()
	const { setUserList } = useUserDataContext();
	const { clientList, setClientList, refetchClientList } =
		useClientDataContext();
	const { projectList, setProjectList } = useProjectsDataContext();

	const { viewer } = useGeneralDataContext();
	const [isNewClient, setIsNewClient] = useState(false);
	const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);

	const startsOnRef = useRef<null | string>(null);
	const endsOnRef = useRef<null | string>(null);
	const clientInputRef = useRef<HTMLInputElement>(null);

	const [
		upsertClient,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_CLIENT, {
		errorPolicy: "all",
		onCompleted({ upsertClient }) {
			setClientList([...clientList, upsertClient]);
		},
	});
	const { setIsInputInFocus } = useGeneralDataContext();
	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			if (upsertProject) {
				refetchClientList();
				setUserList((prev) =>
					prev.map((user) =>
						user.id === upsertProject.assignments?.[0].assignedUser.id
							? {
									...user,
									assignments: [
										...user.assignments,
										...upsertProject.assignments,
									],
							  }
							: user
					)
				);
				setProjectList((prev) => [...prev, upsertProject]);
				router.push(`/projects/${upsertProject.id}`)
			}
		},
	});

	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (!values.clientName) errors.clientName = "Client is required";
		if (!values.projectName) errors.projectName = "Project name is required";

		if (startsOnRef.current) {
			const dateFromISO = DateTime.fromISO(startsOnRef.current);
			const parsedDate = DateTime.fromFormat(startsOnRef.current, "dd.LLL.yy");

			if (!dateFromISO.isValid && !parsedDate.isValid) {
				errors.startsOn = "Invalid start date format. Please use dd/Mon/yr.";
			} else {
				delete errors.startsOn;
			}
		}

		if (endsOnRef.current) {
      const dateFromISO = DateTime.fromISO(endsOnRef.current);
      const parsedDate = DateTime.fromFormat(endsOnRef.current, "dd.LLL.yy");

      if (!dateFromISO.isValid && !parsedDate.isValid) {
        errors.endsOn = "Invalid end date format. Please use dd/Mon/yr.";
      } else {
        delete errors.endsOn;
      }
    }

		const currentClient = clientList.find(
      (client: ClientType) =>
        client.name.toLowerCase() === values.clientName.toLowerCase().trimEnd()
    );
		if (values.projectName && currentClient) {
			const projectNameExists = projectList.find(
        (project: ProjectType) =>
          project.name.toLowerCase() === values.projectName.toLowerCase().trimEnd() &&
          currentClient.id === project.client.id
      );
			if (projectNameExists) {
				errors.projectName = "Project name already in use";
			}
		}

		return errors;
	};

	const formik = useFormik({
		initialValues: {
			projectName: "",
			clientName: "",
			budget: "",
			hours: "",
			startsOn: "",
			endsOn: "",
		},
		validate: validateForm,
		onSubmit: async (values) => {
			let clientId = clientList?.find(
				({ name }: ClientType) => name.toLowerCase() === values.clientName.toLowerCase().trimEnd()
			)?.id;

			if (!clientId) {
				const { data } = await upsertClient({
          variables: { name: values.clientName.trimEnd() },
        });
				clientId = data?.upsertClient?.id;
			}
			const variables = {
        clientId,
        name: values.projectName.trimEnd(),
        hours: +values.hours,
        assignments: [{ userId: viewer?.id, status:'proposed' }],
      };

			const nullableDates = () => {
				if (values.startsOn && values.endsOn) {
					return {
						...variables,
						endsOn: values.endsOn,
						startsOn: values.startsOn,
					};
				}
				if (values.startsOn && !values.endsOn) {
					return { ...variables, startsOn: values.startsOn };
				}
				if (!values.startsOn && values.endsOn) {
					return { ...variables, endsOn: values.endsOn };
				}
				return variables;
			};
			upsertProject({
				variables: nullableDates(),
			});
			closeModal();
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (formik.dirty) {
			formik.handleSubmit();
		}
	};

	const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isNew = !clientList.some(client => client.name.toLowerCase() === e.target.value.toLowerCase().trimEnd())

    if (!e.target.value) {
      setIsNewClient(false);
    } else {
      setIsNewClient(isNew)
    }

		formik.handleChange(e);
	};

	const handleClientSelect = (client: ClientType) => {
		const isNew = !clientList.some((c) => c.name === client.name);

    setIsNewClient(isNew);
		formik.setFieldValue("clientName", client.name);
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

	return (
		<form onSubmit={handleSubmit} className="flex flex-col">
			<div className="flex flex-col mt-2 mb-2">
				<label className="py-1 text-tiny">Project Name</label>
				<input
					type="text"
					name="projectName"
					value={formik.values.projectName}
					onChange={formik.handleChange}
					onFocus={() => setIsInputInFocus(true)}
					onBlur={(e) => {
						formik.handleBlur(e);
						setIsInputInFocus(false);
					  }}
					className="h-10 px-2 rounded-sm shadow-top-input-shadow font-bold focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-huge text-contrastBlue min-w-[370px]"
					placeholder="Project Name"
				/>
				{formik.touched.projectName && formik.errors.projectName ? (
					<p className="text-tiny px-2 text-red-500">
						{formik.errors.projectName}
					</p>
				) : null}
			</div>
			<div className="flex flex-col mt-1 mb-1">
				<label className="py-1 text-tiny">Client</label>
				<AutocompleteInput
					ref={clientInputRef}
					items={clientList}
					inputName="clientName"
					value={formik.values.clientName}
					onItemSelect={handleClientSelect}
					onChange={handleClientChange}
					onBlur={formik.handleBlur}
					isNewItem={isNewClient}
					inputClassName="h-8 px-2 rounded-sm max-w-[370px]"
					listClassName="p-2"
					displayKey="name"
					placeholder="Client"
				/>
			</div>
			{formik.touched.clientName && formik.errors.clientName ? (
				<p className="text-tiny px-2 text-red-500">
					{formik.errors.clientName}
				</p>
			) : null}
			{/* {showNewClientModal && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
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
			)} */}
			{/* <div className="flex flex-col mt-1 mb-1">
				<label className="py-1 text-tiny">Budget (optional)</label>
				<input
					type="text"
					name="budget"
					disabled={true} //temporary
					value={formik.values.budget}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					className="h-6 px-2 text-tiny shadow-top-input-shadow font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]"
					placeholder="Budget"
				/>
				{formik.touched.budget && formik.errors.budget ? (
					<div className="text-tiny px-2 text-red-500">
						{formik.errors.budget}
					</div>
				) : null}
			</div> */}
			<div className="flex flex-col mt-1 mb-1">
				<label className="py-1 text-tiny">Target Hours (optional)</label>
				<input
					type="text"
					name="hours"
					value={formik.values.hours}
					onChange={formik.handleChange}
					onFocus={()=>setIsInputInFocus(true)}
					onBlur={(e)=> {
						setIsInputInFocus(false)
						formik.handleBlur(e)
					}}
					className="h-8 px-2 text-tiny shadow-top-input-shadow font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]"
					placeholder="Hours"
				/>
				{formik.touched.hours && formik.errors.hours ? (
					<div className="text-tiny px-2 text-red-500">
						{formik.errors.hours}
					</div>
				) : null}
			</div>
			<div className="flex flex-row justify-between">
				<div className="flex flex-col mt-1 mb-2 mr-2 w-full">
					<label className="py-1 text-tiny">Start Date (optional)</label>
					<CustomDateInput
						name="startsOn"
						errorString="Invalid start date format. Please use dd/Mon/yr."
						value={formik.values.startsOn}
						onChange={(value) => {
							startsOnRef.current = value
							formik.setFieldValue("startsOn", value)
						}}
						onBlur={() => formik.setFieldTouched("startsOn", true)}
						setError={(error) => {
							formik.setFieldError("startsOn", error)
							formik.setFieldTouched("startsOn", true, false);
						}}
						setDate={(value) => {
							startsOnRef.current = value;
						}}
						classNameForTextInput='h-8'
					/>
					{formik.touched.startsOn && formik.errors.startsOn ? (
						<div className="text-tiny px-2 text-red-500">
							{formik.errors.startsOn}
						</div>
					) : null}
				</div>
				<div className="flex flex-col mt-1 mb-2 w-full ml-2">
                <label className="py-1 text-tiny">Ends Date (optional)</label>
						<CustomDateInput
							name="endsOn"
							errorString="Invalid end date format. Please use dd/Mon/yr."
							value={formik.values.endsOn}
							onChange={(value) => {
								endsOnRef.current = value;
								formik.setFieldValue("endsOn", value)
							}}
							onBlur={() => formik.setFieldTouched("endsOn", true)}
							setError={(error) => {
									formik.setFieldError("endsOn", error)
									formik.setFieldTouched("endsOn", true, false);
							}}
							setDate={(value) => {
								endsOnRef.current = value
							}}
							classNameForTextInput='h-8'
						/>
					{formik.touched.endsOn && formik.errors.endsOn ? (
						<div className="text-tiny px-2 text-red-500">
							{formik.errors.endsOn}
						</div>
					) : null}
				</div>
			</div>
			<button
				type="submit"
				className="w-full h-10 text-tiny font-bold bg-tiffany rounded-sm text-white pt-1 mb-4 mt-2 hover:bg-accentgreen"
				disabled={!formik.isValid}
			>
				Save
			</button>
			{isModalView && (
        <button
          onClick={closeModal}
          className="w-full h-10 text-tiny font-bold bg-contrastGrey hover:bg-contrastBlue rounded-sm text-white py-1 mb-1"
        >
          Cancel
        </button>
      )}
		</form>
	);
};

export default NewProjectForm;
