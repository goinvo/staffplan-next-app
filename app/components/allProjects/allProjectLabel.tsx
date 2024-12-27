import React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AllProjectLabelProps } from "../../typeInterfaces";
import EllipsisProjectMenu from "../ellipsisProjectMenu";
import IconButton from "../iconButton";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";

export const AllProjectLabel = ({
	project,
	clickHandler,
	undoRowRef,
}: AllProjectLabelProps) => {
  const router = useRouter();
  const { showOneClientProjects, setShowOneClientProjects } = useProjectsDataContext()

  const handleClientClick = (client: string) => {
    const encodedClient = client.replace(/[\s,]/g, "_");
    router.push(`/projects?client=${encodeURIComponent(encodedClient)}`);
  };

	return (
    <div className={`flex items-start sm:flex-row flex-col pt-2 ${showOneClientProjects ? 'justify-start' : 'justify-between'}`}>
      {/* <IconButton
				className={'text-contrastBlue w-auto sm:w-[45%] sm:flex hidden text-start transform -translate-x-0.5'}
				Icon={PlusIcon} iconSize='h-4 w-4' text={project.client.name}
				onClick={() => {
					if (showOneClientProjects === project.client.id.toString()) {
						setShowOneClientProjects('')
					} else {
						setShowOneClientProjects(project.client.id.toString());
					}
				}} /> */}

      {/*  <span className="sm:hidden block mr-2">{project.client.name}</span> */}

      {!showOneClientProjects &&<span
        className="block w-auto sm:max-w-[100px] md:max-w-[125px] lg:max-w-[135px] sm:w-full sm:mr-0 mr-2 cursor-pointer"
        onClick={() => {
          if (showOneClientProjects === project.client.id.toString()) {
            setShowOneClientProjects("");
          } else {
            handleClientClick(project.client.name);
            setShowOneClientProjects(project.client.id.toString());
          }
        }}
      >
        {project.client.name}
      </span>}
      <div
        className={`block w-auto sm:max-w-[150px] md:max-w-[160px] lg:max-w-[185px] sm:w-full sm:ml-1 lg:ml-0 sm:mr-0 mr-2 sm:mt-0 mt-2 ${
          showOneClientProjects ? "sm:max-w-max md:max-w-max lg:max-w-max  sm:mr-3" : ""
        }`}
      >
        <button
          onClick={() => clickHandler(project)}
          className="max-w-max font-bold text-contrastBlue text-start"
        >
          {project.name}
        </button>
        {project.status === "archived" && (
          <span className="underline text-contrastBlue text-start">
            &#40;Archived&#41;
          </span>
        )}
      </div>
      <div className={`sm:flex hidden justify-end w-auto ${showOneClientProjects ? "-mt-[5px]": ''}`}>
        <EllipsisProjectMenu undoRowRef={undoRowRef} project={project} />
      </div>
    </div>
  );
};
