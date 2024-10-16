import Image from "next/image";
import React from "react";

import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { UserLabelProps } from "@/app/typeInterfaces";
import { AddPersonInline } from "../addPersonInline";
import { useMutation } from "@apollo/client";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";

export const ProjectUserLabel = ({
	project,
	assignment,
	clickHandler,
}: UserLabelProps) => {
	const { refetchProjectList } = useProjectsDataContext()

	const isUserTBD = assignment.assignedUser === null;
	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted() {
			refetchProjectList();
		},
	});

	const onChangeStatusButtonClick = async () => {
		const variables = {
			id: assignment.id,
			projectId: project?.id,
			userId: assignment.assignedUser.id,
			status: assignment.status === "active" ? "proposed" : "active",
		};
		await upsertAssignment({
			variables
		})
	}
	return (
		<td className='px-0 pr-0 pt-2 pb-2 font-normal flex align-center sm:w-1/3 w-1/2'>
			<div
				className='flex flex-row justify-between items-start'
			>
				{isUserTBD &&
					<AddPersonInline project={project} assignment={assignment} />
				}
				<div className="w-48 font-bold flex text-contrastBlue w-full">

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
					</div>
				</div>
			</div>
			<div className='text-contrastBlue sm:flex hidden flex-col space-y-3 ml-auto px-2 items-end max-w-[60px]'>
				<button className='pt-1 underline' onClick={onChangeStatusButtonClick}>
					{assignment.status === 'proposed' ? 'Proposed' : 'Signed'}
				</button>
				<div className='pt-2'>
					Actual
				</div>
			</div>
		</td >
	);
};