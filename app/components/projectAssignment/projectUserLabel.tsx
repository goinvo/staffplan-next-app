import Image from "next/image";
import React from "react";
import { UserLabelProps } from "@/app/typeInterfaces";

export const ProjectUserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer z-10 w-40 absolute left-0"
			onClick={() => clickHandler(assignment)}
		>
			<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${assignment.assignedUser.avatarUrl}`}
					alt="user avatar"
					width={500}
					height={500}
				/>
			</div>
			<div
				className="hover:cursor-pointer"
				onClick={() => clickHandler(assignment)}
			>
				{assignment.assignedUser.name}
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500"> Unconfirmed</div>
			)}
		</div>
	);
};
