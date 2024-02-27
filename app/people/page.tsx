"use client";
import React, { useEffect, useState, Fragment } from "react";
import withApollo from "@/lib/withApollo";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { ProjectType, UserType } from "../components/addAssignmentModal";
import { DateTime } from "luxon";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

interface AssignmentType {
	id: number;
	endsOn: string | null;
	startsOn: string | null;
	status: string;
	user: UserType;
	workWeeks: [];
	project: ProjectType;
}

interface WorkweekType {
	actualHours: number;
	estimatedHours: number;
	assignmentId: number;
	cweek: number;
	year: number;
}
const GET_USER_ASSIGNMENTS = gql`
	query getUserAssignments($selectedUserId: ID!) {
		userAssignments(userId: $selectedUserId) {
			id
			startsOn
			endsOn
			status
			user {
				name
				id
			}
			workWeeks {
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
const workWeekDate = (weekYear: number, weekNumber: number) =>
	DateTime.fromObject({ weekYear, weekNumber }).toLocaleString();

const PeopleView: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType>({
		id: null,
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
	] = useLazyQuery(GET_USER_ASSIGNMENTS, {
		variables: { selectedUserId: 1 },
	});
	if (called && userAssignmentLoading) return <p>Loading User Assignments</p>;
	if (userListLoading) return <p>Loading Users</p>;
	if (userListError) return <p>Error Loading Users</p>;
	if (userAssignmentError) return <p>Error Loading User Assignments</p>;

	if (userAssignmentData) console.log("USER ASSIGNMENTS", userAssignmentData);
	if (userListData) console.log("USERS DATA", userListData);

	const handleChange = (user: UserType) => {
		console.log(user, "handle change");
		setSelectedUser(user);
		getUserAssignments({ variables: { selectedUserId: user.id } });
	};
	return (
		<div>
			<Listbox value={selectedUser} onChange={handleChange}>
				{({ open }) => (
					<>
						<div className="w-1/2 mr-2">
							<Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
								Person
							</Listbox.Label>
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
			{userAssignmentData ? (
				userAssignmentData.userAssignments.map((assignment: AssignmentType) => (
					<div key={assignment.id}>
						<p className="text-xl underline">
							Project Name: {assignment.project.name}
						</p>
						{assignment.project.endsOn ? (
							<p>Project End Date: {assignment.project.endsOn}</p>
						) : (
							""
						)}
						{assignment.project.startsOn ? (
							<p>Project Start Date: {assignment.project.startsOn}</p>
						) : (
							""
						)}
						<div className="p-3">
							<p>Assignment Status: {assignment.status}</p>
							Assignment Duration
							<p>Starts On: {assignment.startsOn}</p>
							<p>Ends On: {assignment.endsOn}</p>
						</div>
						<div className="p-3">
							{assignment.workWeeks.map((workweek: WorkweekType) => {
								return (
									<div
										className="border-5 pb-3"
										key={`workweek ${assignment.id}`}
									>
										{workweek ? (
											<p>
												Week of: {workWeekDate(workweek.year, workweek.cweek)}
											</p>
										) : (
											""
										)}
										<p>Calendar Week: {workweek.cweek}</p>
										<p>Year: {workweek.year}</p>
										<p>Estimated Hours: {workweek.estimatedHours}</p>
										<p>Actual Hours: {workweek.actualHours}</p>
									</div>
								);
							})}
						</div>
					</div>
				))
			) : (
				<p>User has no Assignments</p>
			)}
		</div>
	);
};

export default withApollo(PeopleView);
