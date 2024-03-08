"use client";
import React, { useEffect, useState, Fragment } from "react";
import withApollo from "@/lib/withApollo";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import {UserType } from "../components/addAssignmentModal";
import { DateTime, Interval } from "luxon";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { WorkWeek, WorkWeekType } from "../components/workWeek";
import { ProjectType } from "../components/addProjectModal";
interface AssignmentType {
	id: number;
	endsOn: string | null;
	startsOn: string | null;
	status: string;
	assignedUser: UserType;
	workWeeks: [];
	project: ProjectType;
}

const GET_USER_ASSIGNMENTS = gql`
	query getUserAssignments($selectedUserId: ID!) {
		userAssignments(userId: $selectedUserId) {
			id
			startsOn
			endsOn
			status
			assignedUser {
				name
				id
			}
			workWeeks {
				id
				actualHours
				assignmentId
				cweek
				estimatedHours
				year
			}
			project {
				name
				id
				startsOn
				endsOn
			}
		}
	}
`;
const GET_USER_LIST = gql`
	{
		users {
			id
			name
		}
	}
`;

const PeopleView: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType>({
		id: NaN,
		name: "Select",
	});

	useEffect(() => {
		setClientSide(true);
	}, []);

	const {
		loading: userListLoading,
		error: userListError,
		data: userListData,
	} = useQuery(GET_USER_LIST, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

	const [
		getUserAssignments,
		{
			data: userAssignmentData,
			loading: userAssignmentLoading,
			error: userAssignmentError,
			called,
		},
	] = useLazyQuery(GET_USER_ASSIGNMENTS,{
		variables: { selectedUserId: selectedUser.id },
	});

	if (called && userAssignmentLoading) return <p>Loading User Assignments</p>;
	if (userListLoading) return <p>Loading Users</p>;
	if (userListError) return <p>Error Loading Users</p>;
	if (userAssignmentError) return <p>Error Loading User Assignments</p>;

	//convert a human readable date to calendar week and year
	const parseProjectDates = (date: string) => {
		return {
			cweek: parseInt(DateTime.fromISO(date).toFormat("W")),
			year: parseInt(DateTime.fromISO(date).toFormat("kkkk")),
		};
	};

	//creates a human readable date from calendar week and year
	const parseWorkWeekDate = (weekYear: number, weekNumber: number) => {
		return DateTime.fromObject({ weekYear, weekNumber }).toISODate();
	};

	//an array of workWeeks with a formatted date added to the object
	const workWeekArr = userAssignmentData?.userAssignments.flatMap(
		(assignment: AssignmentType) =>
			assignment.workWeeks.map((week: WorkWeekType) => {
				const date = parseWorkWeekDate(week.year, week.cweek);
				return { workWeek: week, date };
			})
	);

	//an array of calendar dates, IF an assignment has a start and end date we set the workWeeks to follow those dates, otherwise we generate dates for current week thru end of year
	const calWeekDatesArr = (
		startDate: string | null,
		endDate: string | null
	) => {
		return Interval.fromDateTimes(
			//we set the start date to monday to ensure it captures that week
			startDate
				? DateTime.fromISO(startDate).set({ weekday: 1 })
				: DateTime.now().set({ weekday: 1 }),
			//we set the end date to tuesday to ensure it captures the monday of that week
			endDate
				? DateTime.fromISO(endDate).set({ weekday: 2 })
				: DateTime.now().endOf("year").set({ weekday: 2 })
			// DateTime.now().endOf("year").set({ weekday: 1 })
		)
			.splitBy({ days: 1 })
			.filter((dur: Interval<true>) => dur.start.weekday === 1)
			.map((dur: Interval<true>) => dur.start.toISODate());
	};

	//compare work week data and array of weeks and generate components accordingly
	const workWeekComponentsArr = (
		assignmentStartDate: string | null,
		assignmentEndDate: string | null,
		calWeekDatesArr: (
			assignmentStartDate: string | null,
			assignmentEndDate: string | null
		) => string[],
		workWeekArr: { workWeek: WorkWeekType; date: string }[],
		assignmentId: number
	) => {
		return calWeekDatesArr(assignmentStartDate, assignmentEndDate).map(
			(date: string) => {
				//if a workWeek entry exists for a date include it in the array of work week inputs
				const existingWeek = workWeekArr?.find(
					(week: { workWeek: WorkWeekType; date: string }) =>
						week.date == date && week.workWeek.assignmentId == assignmentId
				);
				if (existingWeek) {
					return (
						<WorkWeek
							key={existingWeek.date}
							workWeek={existingWeek.workWeek}
						/>
					);
				}
				const { cweek, year } = parseProjectDates(date);
				return <WorkWeek key={date} workWeek={{ assignmentId, cweek, year }} />;
			}
		);
	};

	const handleUserChange = (user: UserType) => {
		setSelectedUser(user);
		getUserAssignments({ variables: { selectedUserId: user.id } });
	};

	return (
		<div className="flex flex-col">
			<Listbox value={selectedUser} onChange={handleUserChange}>
				{({ open }) => (
					<>
						<div className="w-1/2 mr-2">
							<Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
								Person
						
							<div className="relative mt-2">
								<Listbox.Button className="relative cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
									<span className="flex items-center">
										<span className="ml-3 block truncate">
											{selectedUser.name}
										</span>
									</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
										<ChevronDownIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</span>
								</Listbox.Button>
							</div>
							</Listbox.Label>
							<Transition
								show={open}
								as={Fragment}
								leave="transition ease-in duration-100"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<Listbox.Options className="absolute z-10 mt-1 max-h-56 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
									{userListData?.users?.map((user: UserType) => (
										<Listbox.Option
											key={user.id}
											className={({ active }) =>
												active
													? "bg-indigo-600 text-white py-3"
													: "text-gray-900 relative cursor-default select-none py-3 pl-3 pr-9"
											}
											value={user}
										>
											{({ selected, active }) => (
												<>
													<div className="flex items-center">
														<span
															className={
																selected
																	? "font-semibold"
																	: "font-normal ml-3 block truncate"
															}
														>
															{user.name}
														</span>
													</div>

													{selected ? (
														<span
															className={
																active
																	? "text-white"
																	: "text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4"
															}
														>
															<CheckIcon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</>
				)}
			</Listbox>

			<div className="flex flex-col items-start">
				{userAssignmentData ? (
					userAssignmentData.userAssignments.map(
						(assignment: AssignmentType) => (
							<div key={assignment.id} className="flex">
								<div>
									<p className="text-xl underline">
										Project Name: {assignment.project.name}
									</p>
									{assignment.project.startsOn ? (
										<p>Project Start Date: {assignment.project.startsOn}</p>
									) : (
										""
									)}
									{assignment.project.endsOn ? (
										<p>Project End Date: {assignment.project.endsOn}</p>
									) : (
										""
									)}
									<div className="p-3">
										<span>Assignment Status:{assignment.status}</span>
										<br />
										<span>Assignment Duration</span>
										<br />
										<span>Starts On: {assignment.startsOn}</span>
										<br />
										<span>Ends On: {assignment.endsOn}</span>
										<br />
									</div>
								</div>
								{assignment.project.startsOn ? (
									<p>
										Project Work Week:
										{parseProjectDates(assignment.project.startsOn).cweek}
									</p>
								) : (
									""
								)}
								<div className="p-3 flex">
									{workWeekComponentsArr(
										assignment.startsOn,
										assignment.endsOn,
										calWeekDatesArr,
										workWeekArr,
										assignment.id
									)}
								</div>
							</div>
						)
					)
				) : (
					<p>User has no Assignments</p>
				)}
			</div>
		</div>
	);
};

export default withApollo(PeopleView);
