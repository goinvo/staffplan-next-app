import React from "react";
import { UserLabelProps } from "../../typeInterfaces";
import EllipsisDropdownMenu from "../ellipsisDropdownMenu";
import { useModal } from "@/app/contexts/modalContext";
import EditAssignmentModal from "./editAssignmentModal";

export const UserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	const { openModal, closeModal } = useModal();
	const isAssignmentProposed = assignment.status === "proposed";
	const assignmentDropMenuOptions = [
		{
			component: (
				<button
					className="text-gray-900 block px-4 py-2 text-sm"
					onClick={() =>
						openModal(
							<EditAssignmentModal
								assignment={assignment}
								closeModal={closeModal}
							/>
						)
					}
				>
					Edit Assignment
				</button>
			),
			show: true,
		},
		// temporary removal of delete button
		// {
		// 	component: () => <button className="text-gray-900 block px-4 py-2 text-sm">Delete</button>,
		// 	show: true,
		// },
	];
	return (
		<div className="sm:ml-auto ml-0 sm:w-24 flex">
			<button
				className={`lg:pl-5 md:ml-2 lg:ml-0 pt-2 ${
					isAssignmentProposed ? "sm:pl-4" : "sm:pl-2"
				} font-bold flex items-center justify-start text-contrastBlue text-start`}
				onClick={() => clickHandler(assignment)}
			>
				{assignment.project.name}
			</button>
			<EllipsisDropdownMenu
				options={assignmentDropMenuOptions}
				textColor={"text-gray-900"}
			/>
		</div>
	);
};
