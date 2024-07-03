import Image from "next/image";
import React from "react";
import { AllUserLabelProps } from "../../typeInterfaces";
import EllipsisPeopleMenu from "../ellipsisPeopleMenu";

export const AllUserLabel = ({ user, clickHandler }: AllUserLabelProps) => {
	return (
		<div className="hover:cursor-pointer z-1 w-40 absolute left-0">
			<div
				className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden"
				onClick={() => clickHandler(user)}
			>
				<Image
					src={`${user.avatarUrl}`}
					alt="client avatar"
					width={500}
					height={500}
				/>
			</div>
			<div className="flex items-center space-x-2">
				<div className="text-sm" onClick={() => clickHandler(user)}>{user.name}</div>
				<div className="hover:cursor-pointer">
					<EllipsisPeopleMenu user={user} />
				</div>
			</div>
		</div>
	);
};
