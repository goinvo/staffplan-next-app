import { AssignmentType } from "@/app/typeInterfaces";
import Image from "next/image";
import React from "react";

interface TempLabelProps {
	assignment: AssignmentType;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const TempProjectLabel = ({ assignment, tempProjectOpen, setTempProjectOpen }: TempLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer w-40 absolute left-10 mt-5 overflow-hidden"
		>
			<div className=" flex w-12 h-12 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${assignment.project.client.avatarUrl}`}
					alt="client avatar"
					width={500}
					height={500}
				/>
			</div>
			<div
				className="hover:cursor-pointer"
			>
				<input/>
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500 text-sm"> Unconfirmed<br/> Assignment</div>
			)}
		</div>
	);
};
