"use client";

import React, { useState, useRef } from "react";
import { useFormik, FormikValues } from "formik";
import { DateTime } from "luxon";
import { useMutation } from "@apollo/client";

import { UPSERT_CLIENT, UPSERT_PROJECT_WITH_INPUT } from "@/app/gqlQueries";
import { ClientType, ProjectType } from "../typeInterfaces";
import { AutocompleteInput } from "./autocompleteInput";
import { useClientDataContext } from "../contexts/clientContext";
import { useGeneralDataContext } from "../contexts/generalContext";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { blockInvalidChar } from "../helperFunctions";
import CustomDateInput from "./customDateInput";

interface EditProjectModalProps {
  project: ProjectType;
  closeModal: () => void;
  isModalView: boolean;
}

const EditProjectModal = ({ project, closeModal, isModalView }: EditProjectModalProps) => {
  const { clientList, setClientList, refetchClientList } =
    useClientDataContext();
  const { projectList,  refetchProjectList } = useProjectsDataContext();

  const {
    name,
    startsOn,
    endsOn,
    hours,
    client: { name: clientName, id: clientId },
    id,
    status,
  } = project; 

  const [isNewClient, setIsNewClient] = useState(false);
  const [isArchiveProject, setIsArchiveProject] = useState(status === "archived");
  const [previousStatus] = useState(status);

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

  const [upsertProjectWithInput] = useMutation(UPSERT_PROJECT_WITH_INPUT, {
      errorPolicy: "all",
      onCompleted({ upsertProjectWithInput }) {
        refetchProjectList();
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
          project.name.toLowerCase() !== name.toLowerCase() &&
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
      projectName: name || "",
      clientName: clientName || "",
      clientId: clientId,
      budget: "",
      hours: hours,
      startsOn: startsOn || "",
      endsOn: endsOn || "",
      projectStatus: status,
    },
    validate: validateForm,
    onSubmit: async (values) => {
      let clientId = clientList?.find(
        (client) =>
          client.name.toLowerCase() ===
          values.clientName.toLowerCase().trimEnd()
      )?.id;

      if (!clientId) {
        const { data } = await upsertClient({
          variables: { name: values.clientName.trimEnd() },
        });
        clientId = data?.upsertClient?.id;
      }
      const input = {
        id: id,
        clientId: clientId,
        name: values.projectName,
        hours: +values.hours,
        startsOn: values.startsOn || null,
        endsOn: values.endsOn || null,
        status: values.projectStatus,
      };

      await upsertProjectWithInput({
        variables: { input },
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
    const isNew = !clientList.some(
      (client) =>
        client.name.toLowerCase() === e.target.value.toLowerCase().trimEnd()
    );

    if (!e.target.value) {
      setIsNewClient(false);
    } else {
      setIsNewClient(isNew);
    }

    formik.handleChange(e);
  };

  const handleClientSelect = (client: ClientType) => {
    const isNew = !clientList.some((c) => c.name === client.name);

    setIsNewClient(isNew);
    formik.setFieldValue("clientName", client.name);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsArchiveProject(isChecked);

    const newStatus = !isArchiveProject
      ? "archived"
      : previousStatus !== "archived"
      ? previousStatus
      : "unconfirmed";
    formik.setFieldValue("projectStatus", newStatus, false);
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
          onBlur={formik.handleBlur}
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
          type="number"
          name="hours"
          value={formik.values.hours.toString()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          onKeyDown={(e) => {
            const invalidChars = ["e", "E", "+", "-", ".", ","];
            blockInvalidChar(e, invalidChars);
          }}
          className="h-8 px-2 text-tiny shadow-top-input-shadow font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              startsOnRef.current = value;
              formik.setFieldValue("startsOn", value);
            }}
            onBlur={() => formik.setFieldTouched("startsOn", true)}
            setError={(error) => {
              formik.setFieldError("startsOn", error);
              formik.setFieldTouched("startsOn", true, false);
            }}
            setDate={(value) => {
              startsOnRef.current = value;
            }}
            classNameForTextInput="h-8"
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
              formik.setFieldValue("endsOn", value);
            }}
            onBlur={() => formik.setFieldTouched("endsOn", true)}
            setError={(error) => {
              formik.setFieldError("endsOn", error);
              formik.setFieldTouched("endsOn", true, false);
            }}
            setDate={(value) => {
              endsOnRef.current = value;
            }}
            classNameForTextInput="h-8"
          />
          {formik.touched.endsOn && formik.errors.endsOn ? (
            <div className="text-tiny px-2 text-red-500">
              {formik.errors.endsOn}
            </div>
          ) : null}
        </div>
      </div>
      <label className="flex items-center justify-between space-x-0.5 cursor-pointer w-[208px]">
        <input
          type="checkbox"
          checked={isArchiveProject}
          onChange={handleCheckboxChange}
          className={`border-none form-checkbox h-[11px] w-[11px] rounded-sm text-tiffany !ring-0 !ring-offset-0
            ${isArchiveProject ? "" : "shadow-top-input-shadow"}`}
        />
        <span className="mt-2 mb-3 text-sm leading-[18px] font-normal">
          Archive project for everyone?
        </span>
      </label>
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

export default EditProjectModal;
