import Image from "next/image";
import React from "react";
import { AllUserLabelProps } from "../../typeInterfaces";

export const AllUserLabel = ({ user, clickHandler }: AllUserLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer z-10 w-64 absolute left-0"
			onClick={() => clickHandler(user)}
		>
			<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${user.avatarUrl}`}
					alt="client avatar"
					width={500}
					height={500}
				/>
			</div>
			<div>{user.name}</div>
			<div
				className="hover:cursor-pointer"
				onClick={() => clickHandler(user)}
			>
			</div>
		</div>
	);
};
