import Image from 'next/image'
import React from 'react'
import { UserLabelProps } from '../typeInterfaces';

export const UserLabel = ({assignment, clickHandler}:UserLabelProps) => {
  return (
    <div
				className="hover:cursor-pointer z-10 w-64"
				onClick={() => clickHandler(assignment)}
			>
				<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
					<Image
						src={`${assignment.project.client.avatarUrl}`}
						alt="client avatar"
						width={500}
						height={500}
					/>
				</div>
				<div>{assignment.project.client.name}</div>
				<div
					className="hover:cursor-pointer"
					onClick={() => clickHandler(assignment)}
				>
					{assignment.project.name}
				</div>
				{assignment.status === "active" ? null : (
					<div className="text-red-500"> Unconfirmed Assignment</div>
				)}
			</div>
  )
}
