import Image from "next/image";
import React from "react";
import { UserLabelProps } from "../../typeInterfaces";

export const UserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer w-40 absolute left-10 mt-5 overflow-hidden"
			onClick={() => clickHandler(assignment)}
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
				onClick={() => clickHandler(assignment)}
			>
				{assignment.project.name}
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500 text-sm">
					{" "}
					Unconfirmed
					<br /> Assignment
				</div>
			)}
		</div>
	);
};
