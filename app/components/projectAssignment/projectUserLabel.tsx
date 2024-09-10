import Image from "next/image";
import React from "react";
import { UserLabelProps } from "@/app/typeInterfaces";
import { MdQuestionMark } from "react-icons/md";

export const ProjectUserLabel = ({
	assignment,
	clickHandler,
}: UserLabelProps) => {
	const isUserTBD = assignment.assignedUser === null;

	return (
		<td className='px-0 pr-0 pt-2 pb-2 font-normal flex align-center w-1/3'>
			<div
				className='flex flex-row justify-between items-start'
			>
				<div className="w-48 font-bold flex text-contrastBlue w-full">
					{isUserTBD &&

						(
							<div className="flex flex-row items-center">
								<div className="h-[28px] w-[38px] rounded-md bg-blueGreyLight flex items-center justify-center rounded mr-2">
									<MdQuestionMark className="text-black h-4 w-3" />

								</div>
								<div className="text-start">
									<span>TBD</span>
								</div>
							</div>)}
					{!isUserTBD && (<div className="py-2 relative overflow-hidden w-[38px] h-[28px]  aspect-w-38 aspect-h-28">
						<Image
							src={assignment.assignedUser.avatarUrl}
							className="rounded-md object-cover"
							alt="user avatar"
							fill
							sizes="(max-width: 640px) 28px, (max-width: 768px) 38px, 38px"
						/>
					</div>)}
					<div className="flex flex-col items-center justify-center">
						{!isUserTBD &&
							(<button className="px-2" onClick={() => clickHandler(assignment)}>
								{assignment.assignedUser.name}
							</button>)}
						<div>
							{assignment.status !== 'active' && !isUserTBD &&
								(
									<span className="px-2 text-red-500 font-normal">
										Unconfirmed
									</span>
								)}
						</div>
					</div>
				</div>
			</div>
			<div className='text-contrastBlue flex flex-col space-y-3 ml-auto px-2 items-end max-w-[60px]'>
				<div className='pt-1 underline'>
					{assignment.status === 'proposed' ? 'Proposed' : 'Signed'}
				</div>
				<div className='pt-2'>
					Actual
				</div>
			</div>
		</td >
	);
};