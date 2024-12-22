"use client";

import {
  ProjectType,
  ClientType,
  UserType,
} from "@/app/typeInterfaces";

import React, { useRef, useEffect, useState } from "react";
import { useFormik, FormikValues } from "formik";
import { useMutation } from "@apollo/client";
import { UPSERT_PROJECT, UPSERT_CLIENT, UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useClientDataContext } from "@/app/contexts/clientContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { AutocompleteInput } from "../autocompleteInput";
import { useUserDataContext } from "@/app/contexts/userDataContext";

type AddProjectFormProps = {
  user: UserType;
};

type UpsertProjectVariables = {
  clientId: string;
  name: string;
  assignments: [{ userId: string }];
};

type UpsertAssignmentVariables = {
  projectId: string;
  userId: string;
  status: string;
};

export const AddProjectForm: React.FC<AddProjectFormProps> = ({user}) => {
  const clientInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);

  const { headerTitleWidth, isAddNewProject, setIsAddNewProject } = useGeneralDataContext();
  const { clientList, refetchClientList } = useClientDataContext();
  const { projectList, setProjectList } = useProjectsDataContext();
  const { setUserList, setNewProjectAssignmentId } = useUserDataContext();

  const { id: currentUserId, assignments } = user;

  
  const [upsertClient] = useMutation(UPSERT_CLIENT, {
    errorPolicy: "all",
    onCompleted() {
      refetchClientList();
    },
  });

  const [upsertProject] = useMutation(UPSERT_PROJECT, {
    errorPolicy: "all",
    onCompleted({ upsertProject }) {
      if (upsertProject) {
        refetchClientList();
        setNewProjectAssignmentId(Number(upsertProject.id));

        setProjectList((prev) => [...prev, upsertProject]);
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
      }
    },
  });

  const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
    errorPolicy: "all",
    onCompleted({ upsertAssignment }) {
      refetchClientList();
      setNewProjectAssignmentId(Number(upsertAssignment?.project?.id));

      setUserList((prev) =>
        prev.map((user) =>
          user.id === upsertAssignment.assignedUser.id
            ? {
                ...user,
                assignments: [...user.assignments, upsertAssignment],
              }
            : user
        )
      );
      setProjectList((prevProjectList) => {
        return prevProjectList?.map((project) => {
          if (project.id === upsertAssignment?.project?.id) {
            return {
              ...project,
              assignments: [...(project.assignments || []), upsertAssignment],
            };
          }
          return project;
        });
      });
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (isAddNewProject && clientInputRef.current) {
        clientInputRef.current.focus()
      }
    }, 500);
    
  }, [isAddNewProject]);

  const createNewProject = async (variables: UpsertProjectVariables) => {
    await upsertProject({
      variables,
    });
  };

  const addNewAssignmentWithExistingProject = async (
    variables: UpsertAssignmentVariables
  ) => {
    await upsertAssignment({
      variables,
    });
  };

  const validateForm = (values: FormikValues) => {
    const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
    if (!values.clientName) errors.clientName = "Client is required";
    if (!values.projectName) errors.projectName = "Project name is required";

    return errors;
  };
    
  const formik = useFormik({
    initialValues: {
      projectName: "",
      clientName: "",
      projectList: projectList.filter((p) => !p.assignments?.some((a) => a?.assignedUser?.id === currentUserId)),
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

      const foundProject = projectList.find(
        (project) =>
          project.name.toLowerCase() === values.projectName.toLowerCase().trimEnd() && project.client.id === clientId
      );

      if (foundProject) {
        const projectInAssignments = assignments.some(
          (assignment) => assignment.project.id === foundProject.id
        );

        if (!projectInAssignments) {
          const variables: UpsertAssignmentVariables = {
            projectId: String(foundProject.id),
            userId: String(currentUserId),
            status: "proposed",
          };

          await addNewAssignmentWithExistingProject(variables);
        }
      } else {
        const variables: UpsertProjectVariables = {
          clientId: String(clientId),
          name: values.projectName.trimEnd(),
          assignments: [{ userId: String(currentUserId) }],
        };

        await createNewProject(variables);
      }

      formik.setFieldValue("clientName", "", false);
      formik.setFieldValue("projectName", "", false);
      
      setIsAddNewProject(false);
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

  const handleClientBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filteredProjects = formik.values.clientName
      ? projectList.filter((p) =>
        (p.client.name.toLowerCase() === formik.values.clientName.toLowerCase().trimEnd() && !p.assignments?.some((a) => a?.assignedUser?.id === currentUserId)))
      : projectList.filter((p) => !p.assignments?.some((a) => a?.assignedUser?.id === currentUserId))
    
    formik.setFieldValue("projectList", filteredProjects);
    formik.handleBlur(e)
  }

  const handleProjectSelect = (project: ProjectType) => {
    const isNew = !projectList.some((c) => c.name === project.name);

    setIsNewProject(isNew);
    formik.setFieldValue("projectName", project.name);
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

    formik.handleSubmit();
  };

  return (
    <tr
      className={`sm:flex hidden w-full pl-[10px] border-gray-300 transition-all duration-700 ease-in-out delay-100 
          ${isAddNewProject ? "opacity-100 h-[100px] pointer-events-auto border-b" : "opacity-0 h-0 pointer-events-none border-b-0"}`}
    >
      <td
        className="sm:block flex items-center pt-1 pb-2 px-0 font-normal align-top"
        style={{ width: headerTitleWidth ?? "auto" }}
      >
        <form
          onKeyDown={handleKeyDown}
          className="flex justify-between w-full h-10 pt-3 border"
        >
          <div className="w-full sm:max-w-[68px] md:max-w-[85px] lg:max-w-[115px]">
            <AutocompleteInput
              ref={clientInputRef}
              placeholder="Client"
              items={clientList}
              inputName="clientName"
              value={formik.values.clientName}
              onItemSelect={handleClientSelect}
              onChange={handleClientChange}
              onBlur={handleClientBlur}
              inputClassName={`h-7 rounded-sm w-full ${
                isNewClient && "pr-[38px]"
              }`}
              listClassName="p-2"
              displayKey="name"
              isNewItem={isNewClient}
            />
            {formik.touched.clientName && formik.errors.clientName ? (
              <p className="text-[10px] leading-3 pt-1 px-2 text-red-500">
                {formik.errors.clientName}
              </p>
            ) : null}
          </div>
          <div className="w-full sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] sm:ml-[10px] md:ml-[10px] lg:ml-[14px]">
            <AutocompleteInput
              ref={projectInputRef}
              placeholder="Project name"
              items={formik.values.projectList}
              inputName="projectName"
              value={formik.values.projectName}
              onItemSelect={handleProjectSelect}
              onChange={handleProjectChange}
              onBlur={formik.handleBlur}
              inputClassName={`h-7 rounded-sm w-full ${
                isNewProject && "pr-[38px]"
              }`}
              listClassName="p-2"
              displayKey="name"
              isNewItem={isNewProject}
            />
            {formik.touched.projectName && formik.errors.projectName ? (
              <p className="text-[10px] leading-3 pt-1 px-2 text-red-500">
                {formik.errors.projectName}
              </p>
            ) : null}
          </div>
          <div className="sm:w-[70px] md:w-[60px]"></div>
        </form>
      </td>
      <td className="sm:block items-center sm:-ml-5 md:-ml-3 lg:-ml-8 pt-[17px] pb-2 px-0 font-normal align-top">
        <button
          type="submit"
          className="bg-tiffany px-3 py-1 rounded-[3px]"
          onClick={(e) => {
            handleSaveClick(e);
          }}
        >
          Save
        </button>
      </td>
    </tr>
  );
};