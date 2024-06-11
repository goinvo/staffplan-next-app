import Image from "next/image";
import React from "react";
import { AllProjectLabelProps } from "../../typeInterfaces";
import EllipsisProjectMenu from "../ellipsisProjectMenu";

export const AllProjectLabel = ({
	project,
	clickHandler,
}: AllProjectLabelProps) => {
	return (
		<div>
			<div className="hover:cursor-pointer z-1 w-64 absolute left-0">
				<div
					className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden"
					onClick={() => clickHandler(project)}
				>
					<Image
						src={`${project.client.avatarUrl}`}
						alt="client avatar"
						width={500}
						height={500}
					/>
				</div>
				<div>{project.name}</div>
				<EllipsisProjectMenu project={project} />
				<div
					className="hover:cursor-pointer"
					onClick={() => clickHandler(project)}
				></div>
			</div>
		</div>
	);
};
