import React from "react";

import NewProjectForm from "../components/newProjectForm";


const CreateProjectForm: React.FC = () => {

  return (
    <div className="w-full h-full flex flex-wrap flex-col justify-center content-center ">
      <div className="w-[372px]">
        <div className="w-[280px] pt-10 pb-6 font-bold text-[28px] leading-9">Lets create your first project</div>
        <NewProjectForm closeModal={() => {}} isModalView={false} />
      </div>
    </div>
  );
};

export default CreateProjectForm;
