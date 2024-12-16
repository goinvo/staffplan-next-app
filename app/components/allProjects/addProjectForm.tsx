"use client";

import {
  ProjectType,
  AllProjectRowProps,
  MonthsDataType,
  ClientType,
} from "@/app/typeInterfaces";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, useFormik, FormikValues, FormikHelpers } from "formik";
import { useMutation } from "@apollo/client";
import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";
import ProjectSummary from "../projectSummary";
import ColumnChart from "../columnChart";
import {
  calculateTotalHoursPerWeek,
  isBeforeWeek,
  currentWeek,
  currentYear,
} from "../scrollingCalendar/helpers";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useClientDataContext } from "@/app/contexts/clientContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { AutocompleteInput } from "../autocompleteInput";
import { useUserDataContext } from "@/app/contexts/userDataContext";

export const AddProjectForm = () => {
  const clientInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);

  const { isAddNewProject, setIsAddNewProject } = useGeneralDataContext();
  const { clientList, setClientList, refetchClientList } = useClientDataContext();
  const { projectList, setProjectList, setNewProjectId } = useProjectsDataContext();
  
  const [
    upsertClient,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(UPSERT_CLIENT, {
    errorPolicy: "all",
    onCompleted({ upsertClient }) {
      setClientList([...clientList, upsertClient]);
    },
  });
  
  const [upsertProject] = useMutation(UPSERT_PROJECT, {
    errorPolicy: "all",
    onCompleted({ upsertProject }) {
      if (upsertProject) {
        refetchClientList();

        setNewProjectId(Number(upsertProject.id));
        setProjectList((prev) => [upsertProject, ...prev]);
      }
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (isAddNewProject && clientInputRef.current) {
        clientInputRef.current.focus()
      }
    }, 500);
    
  }, [isAddNewProject]);

  const checkProjectNameExists = (
    clientList: ClientType[],
    projectList: ProjectType[],
    clientName: string,
    projectName: string
  ): boolean => {
    const currentClient = clientList.find((client) => client.name.toLowerCase() === clientName.toLowerCase().trimEnd());

    if (projectName && currentClient) {
      return projectList.some((project) => project.name.toLowerCase() === projectName.toLowerCase().trimEnd() && currentClient.id === project.client.id);
    }

    return false;
  };

  const validateForm = (values: FormikValues) => {
    const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
    if (!values.clientName) errors.clientName = "Client is required";
    if (!values.projectName) errors.projectName = "Project name is required";
    
    if (values.projectName && checkProjectNameExists(clientList, projectList, values.clientName, values.projectName)) {
      errors.projectName = "Project name already in use";
    }

    return errors;
  };
    
  const formik = useFormik({
    initialValues: {
      projectName: "",
      clientName: "",
    },
    validate: validateForm,
    onSubmit: async (values) => {
      let clientId = clientList?.find(
        ({ name }: ClientType) => name.toLowerCase() === values.clientName.toLowerCase().trimEnd()
      )?.id;

      if (!clientId) {
        const { data } = await upsertClient({
          variables: { name: values.clientName },
        });
        clientId = data?.upsertClient?.id;
      }

      const variables = {
        clientId,
        name: values.projectName,
        hours: 0,
      };

      upsertProject({
        variables: variables,
      });

      setIsAddNewProject(false)
    },
  });
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();

      const activeElement = document.activeElement;

      if (activeElement === clientInputRef.current) {
        if (!formik.values.clientName) {
          formik.setFieldTouched("clientName", true, true);
          formik.setFieldError("clientName", "Client is required");

          if (clientInputRef.current) {
            clientInputRef.current.focus();
          }
          return;
        } else if (projectInputRef.current) {
          projectInputRef.current.focus();
        }
        return;
      }

      if (activeElement === projectInputRef.current) {
        if (!formik.values.projectName) {
          formik.setFieldTouched("projectName", true, true);
          formik.setFieldError("projectName", "Project name is required");

          projectInputRef.current?.focus();
          return;
        } else if (!formik.values.clientName) {
          clientInputRef.current?.focus();
          formik.setFieldTouched("clientName", true, true);
          formik.setFieldError("clientName", "Client is required");
          return;
        }

        const projectExists = checkProjectNameExists( clientList, projectList, formik.values.clientName, formik.values.projectName);

        if (projectExists) {
          formik.setFieldTouched("projectName", true, true);
          formik.setFieldError("projectName", "Project name already in use");

          projectInputRef.current?.focus();
          return;
        }
      }

      formik.handleSubmit();      
    }
  };
  
  
  const handleClientSelect = (client: ClientType) => {
    const isNew = !clientList.some((c) => c.name === client.name);

    setIsNewClient(isNew);
    formik.setFieldValue("clientName", client.name, false);

    setTimeout(() => {
      if (projectInputRef.current) {
        projectInputRef.current.focus();
      }
    }, 0);
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
  
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isNew = !projectList.some(project => project.name.toLowerCase() === e.target.value.toLowerCase().trimEnd())
    
    if (!e.target.value) {
      setIsNewProject(false);
    } else {
      setIsNewProject(isNew);
    }
    formik.handleChange(e);
  }
  
  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const { clientName, projectName } = formik.values;

    if (!clientName && !projectName) {
      formik.setFieldTouched("clientName", true, true);
      formik.setFieldError("clientName", "Client is required");

      formik.setFieldTouched("projectName", true, true);
      formik.setFieldError("projectName", "Project name is required");

      if (clientInputRef.current) {
        clientInputRef.current.focus();
      }
      return;
    }

    if (!clientName) {
      formik.setFieldTouched("clientName", true, true);
      formik.setFieldError("clientName", "Client is required");

      if (clientInputRef.current) {
        clientInputRef.current.focus();
      }
      return;
    }

    if (!projectName) {
      formik.setFieldTouched("projectName", true, true);
      formik.setFieldError("projectName", "Project name is required");

      if (projectInputRef.current) {
        projectInputRef.current.focus();
      }
      return;
    }

    const projectExists = checkProjectNameExists(clientList,projectList,clientName,projectName);

    if (projectExists) {
      formik.setFieldTouched("projectName", true, true);
      formik.setFieldError("projectName", "Project name already in use");

      projectInputRef.current?.focus();
      return;
    }

    formik.handleSubmit();
  };

  return (
    <tr
      className={`sm:flex hidden w-full border-b border-gray-300 transition-all duration-700 ease-in-out delay-100 
          ${isAddNewProject ? "opacity-100 h-[100px] pointer-events-auto" : "opacity-0 h-0 pointer-events-none"}`}
    >
      <td className="sm:block flex items-center pt-1 pb-2 px-0 font-normal align-top w-1/2 sm:w-1/3">
        <form
          onKeyDown={handleKeyDown}
          className="flex justify-between w-full h-10 pt-3 border"
        >
          <div className="w-full max-w-[35%] pl-3">
            <AutocompleteInput
              ref={clientInputRef}
              placeholder="Client"
              items={clientList}
              inputName="clientName"
              value={formik.values.clientName}
              onItemSelect={handleClientSelect}
              onChange={handleClientChange}
              onBlur={formik.handleBlur}
              inputClassName={`h-7 rounded-sm w-full ${
                isNewClient && "pr-[38px]"
              }`}
              listClassName="p-2"
              displayKey="name"
              isNewItem={isNewClient}
            />
            {formik.touched.clientName && formik.errors.clientName ? (
              <p className="text-tiny px-2 text-red-500">
                {formik.errors.clientName}
              </p>
            ) : null}
          </div>
          <div className="relative w-full max-w-[35%] pl-3 box-border">
            <input
              ref={projectInputRef}
              type="text"
              name="projectName"
              value={formik.values.projectName}
              onChange={handleProjectChange}
              onBlur={formik.handleBlur}
              className={`h-7 w-full px-2 ${
                isNewProject && "pr-[38px]"
              } text-tiny font-bold placeholder:font-normal shadow-top-input-shadow rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-contrastBlue appearance-none`}
              placeholder="Project Name"
            />
            {isNewProject && (
              <span className="absolute top-[5px] right-[3px] px-1 pt-[3px] pb-1 text-white text-xs leading-[12px] bg-[#AFB3BF] rounded-[3px]">
                new
              </span>
            )}
            {formik.touched.projectName && formik.errors.projectName ? (
              <p className="text-tiny px-2 text-red-500">
                {formik.errors.projectName}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="bg-tiffany px-3 rounded-[3px]"
            onClick={(e) => {
              handleSaveClick(e)
            }}
          >
            Save
          </button>
        </form>
      </td>
      {/* {months?.map((month: MonthsDataType) =>
        month.weeks.map((week) => {
          const isCurrenWeek =
            currentWeek === week.weekNumberOfTheYear &&
            currentYear === month.year;
          return (
            <td
              key={`${month.monthLabel}-${week.weekNumberOfTheYear}`}
              className={`relative px-1 py-1 min-h-[100px] w-[42px] ${
                isCurrenWeek ? "bg-selectedColumnBg font-bold" : ""
              }`}
            >
            </td>
          );
        })
      )} */}

      {/* {isLastMonth && <ProjectSummary project={project} />} */}

      <td className="w-2/3"></td>
    </tr>
  );
};
