import React from "react";
import { DateTime } from "luxon";

import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import { AssignmentType, UserSummaryProps } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import IconButton from "./iconButton";
import { UPSERT_ASSIGNMENT } from "../gqlQueries";
import { useMutation } from "@apollo/client";

const UserSummary: React.FC<UserSummaryProps> = ({ assignment,selectedUser, setSelectedUser, setTempProjectOpen }) => {
	const { viewsFilter } = useUserDataContext();
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	const {refetchUserList} = useUserDataContext();
	const pastPlan = () => {
		const now = DateTime.now();
		const startOfAssignment = DateTime.fromISO(assignment.startsOn ?? "");
		const timeBetween = now.diff(startOfAssignment, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};
	const futurePlan = () => {
		const now = DateTime.now();
		const endOfAssignment = DateTime.fromISO(assignment.endsOn ?? "");
		const timeBetween = endOfAssignment.diff(now, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};
	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ upsertAssignment }) {
			refetchUserList();
		},
	});
	const handleArchiveItemClick = () => {
		if(assignment.project.isTempProject){
			const removedTempAssignment = selectedUser.assignments.filter((a:AssignmentType) => a.id !== assignment.id);
			const selectedUserData = {
			...selectedUser,
			assignments: removedTempAssignment
		};
			setTempProjectOpen(false);
			setSelectedUser(selectedUserData);
			return;
		}
		if (assignment.status !== 'archived') {
			const variables = {
				id: assignment.id,
				projectId: assignment.project.id,
				userId: assignment.assignedUser.id,
				status: 'archived'
			};
			upsertAssignment({
				variables
			})
		}
	}

	return (
		<td className="font-normal py-2 pl-4 w-1/6 flex items-center justify-between">
			{viewsFilter.showSummaries ? (
				<div>
					{futurePlan() ? (
						<div className='space-y-4'>
							<label className="text-sm pr-1">future plan</label>
							<span className="font-bold text-sm">
								{futurePlan()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
					<div className='space-y-4'>
						<label className="text-sm pr-1">burned</label>
						<span className="font-bold text-sm">
							{burnedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					{pastPlan() ? (
						<div className='space-y-4'>
							<label className="text-sm pr-1">past plan</label>
							<span className="font-bold text-sm">
								{pastPlan()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
				</div>
			) : null}
			<div className="flex items-start justify-center">
				<IconButton className='text-black flex items-start justify-center text-transparentGrey'
					onClick={() => {
						handleArchiveItemClick()}}
					Icon={ArchiveBoxIcon}
					iconSize={'h6 w-6'} />
			</div>
		</td >
	);
};

export default UserSummary;
