'use client'

import React, { useState } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import UserSummary from "../userSummary";
import { UserLabel } from "./userLabel";
import { WorkWeekInput } from "./workWeekInput";
import { ClientLabel } from "./clientLabel";
import { TempProjectLabel } from "./tempProjectLabel";
import { currentWeek, currentYear } from "../scrollingCalendar/helpers";
import { AssignmentType, ClientType, MonthsDataType, UserType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";

interface UserAssignmentRowProps {
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	isFirstClient: boolean;
	clickHandler: (client: ClientType) => void;
	months?: MonthsDataType[];
	selectedUser: UserType;
	setSelectedUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export const UserAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	isFirstClient,
	clickHandler,
	months,
	selectedUser,
	setSelectedUser
}: UserAssignmentRowProps) => {
	const router = useRouter();
	const [tempProjectOpen, setTempProjectOpen] = useState(false)

	const { viewsFilter, refetchUserList } = useUserDataContext();
	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted() {
			refetchUserList();
		},
	});
	const handleProjectChange = (assignment: AssignmentType) => {
		router.push("/projects/" + encodeURIComponent(assignment.project.id));
	};

	const isWeekWithinProject = (weekNumber: number, year: number): boolean => {
		const weekDateFormatted = DateTime.fromObject({ weekNumber, weekYear: year, weekday: 1 }).toJSDate();
		if (assignment.project.startsOn && !assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (assignment.project.startsOn && assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			const endsOn = new Date(assignment.project.endsOn);
			return weekDateFormatted >= startsOn && weekDateFormatted <= endsOn;
		}
		return true;
	};


	const onChangeStatusButtonClick = async () => {
		const variables = {
			id: assignment.id,
			projectId: assignment?.project.id,
			userId: selectedUser.id,
			status: assignment.status === "active" ? "proposed" : "active",
		};
		await upsertAssignment({
			variables
		})
	}
	return (
		<tr
			className={`flex ${isFirstClient ? '' : 'border-b border-gray-300'} ${assignment.status === 'proposed' ? 'bg-diagonal-stripes' :
				''
				} hover:bg-hoverGrey min-h-[100px] pl-5`}>
			<td className='px-0 pt-1 pb-2 font-normal align-top w-1/3'>
				<div
					className='flex flex-row justify-between items-start space-x-2'
				>
					<div className={`${isFirstClient ? 'flex' : 'w-24'}`}>
						{viewsFilter.singleUserSort === 'byClient' && isFirstClient && isFirstMonth && (
							<ClientLabel assignment={assignment} clickHandler={clickHandler} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} selectedUser={selectedUser} />
						)}
						{viewsFilter.singleUserSort !== 'byClient' && isFirstMonth && (
							<ClientLabel assignment={assignment} clickHandler={clickHandler} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} selectedUser={selectedUser}  />
						)}
					</div>
					{isFirstMonth && (
						assignment.project.isTempProject ? (
							<TempProjectLabel assignment={assignment} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} /> // Render custom label
						) : (
							<UserLabel assignment={assignment} clickHandler={handleProjectChange} />
						)
					)}
					<div className='text-contrastBlue flex flex-col space-y-3 ml-auto px-2 items-end max-w-[60px]'>
						<button className='pt-2 underline' onClick={onChangeStatusButtonClick}>
							{assignment.status === 'proposed' ? 'Proposed' : 'Signed'}
						</button>
						<div className='pt-2'>
							Actual
						</div>
					</div>
				</div>
			</td>
			{months?.map((month: MonthsDataType, index) => {
				return month.weeks.map((week) => {
					const withinProjectDates = isWeekWithinProject(week.weekNumberOfTheYear, month.year);
					return (
						<td key={`${assignment.id}-${month.monthLabel}-${week.weekNumberOfTheYear}`}
							className={`relative px-1 py-1 font-normal ${currentWeek === week.weekNumberOfTheYear && currentYear === month.year && 'bg-selectedColumnBg'}`}

						>
							<div className={`flex flex-col space-y-3 ${currentWeek === week.weekNumberOfTheYear && currentYear === month.year ? 'font-bold' : 'font-normal'}`}>
								<WorkWeekInput
									withinProjectDates={withinProjectDates}
									assignment={assignment}
									cweek={week.weekNumberOfTheYear}
									year={month.year}
									key={`input-${assignment.id}-${month.monthLabel}-${week.weekNumberOfTheYear}`}
								/>

							</div>
						</td>)
				});
			})}
			{isLastMonth && <UserSummary assignment={assignment} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setTempProjectOpen={setTempProjectOpen} tempProjectOpen={tempProjectOpen}/>}
		</tr >
	);
};
