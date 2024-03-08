"use client";
import React, { useEffect, useState, useCallback, Fragment } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import withApollo from "@/lib/withApollo";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { UserType } from "../components/addAssignmentModal";
import { DateTime, Interval } from "luxon";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { WorkWeek, WorkWeekType } from "../components/workWeek";
import {
	parseProjectDates,
	parseWorkWeekDate,
	AssignmentType,
} from "../people/helperFunctions";

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
		id: null,
		name: "Select",
	});
	const router = useRouter();
	const pathname = usePathname();

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

	const handleUserChange = (user: UserType) => {
		router.push(pathname + "/" + encodeURIComponent(user.name.toString()));
	};

	return (
		<div className="flex flex-col">
			<Listbox value={selectedUser} onChange={handleUserChange}>
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
		</div>
	);
};

export default withApollo(PeopleView);
