import Image from "next/image";
import React from "react";
import { AllUserLabelProps } from "../../typeInterfaces";
import EllipsisPeopleMenu from "../ellipsisPeopleMenu";

export const AllUserLabel = ({ user, clickHandler }: AllUserLabelProps) => {
	return (
		<td className='pr-2 pl-0 pt-1 pb-2 font-normal flex align-center sm:w-1/3 w-1/2'>
			<div className="sm:w-48 pl-1 font-bold flex items-center justify-start text-contrastBlue">
				<div
					className="px-2 py-2 relative overflow-hidden w-[38px] h-[28px] aspect-w-38 aspect-h-28 cursor-pointer"
					onClick={() => clickHandler(user)}
				>
					<Image
						src={`${decodeURIComponent(user.avatarUrl)}`}
						alt="client avatar"
						className="rounded-md object-cover"
						fill
						sizes="(max-width: 640px) 28px, (max-width: 768px) 38px, 38px"
					/>
				</div>
				<button className="sm:px-2 px-1 sm:whitespace-nowrap" onClick={() => clickHandler(user)}>{user.name}</button>
				{/* <div className="hover:cursor-pointer ml-auto sm:flex hidden">
					<EllipsisPeopleMenu user={user} />
				</div> */}
			</div>
		</td >
	);
};
