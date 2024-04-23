"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import withApollo from "@/lib/withApollo";
import { useUserDataContext } from "../userDataContext";
import {
	UserType,
	AssignmentType,
	UserAssignmentDataMapType,
	WorkWeekType,
	WorkWeekBlockMemberType,
} from "../typeInterfaces";
import {
	processUserAssignmentDataMap,
	getWorkWeeksForUserByWeekAndYear,
	drawBars,
	drawFTELabels,
} from "../helperFunctions";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import Image from "next/image";
import EllipsisPeopleMenu from "../components/ellipsisPeopleMenu";
const PeopleView: React.FC = () => {
	const [userAssignmentDataMap, setUserAssignmentDataMap] =
		useState<UserAssignmentDataMapType>({});
	const [rowIdtoUserIdMap, setRowIdtoUserIdMap] = useState<Map<number, number>>(
		new Map()
	);
	const router = useRouter();
	const pathname = usePathname();

	const { userList } = useUserDataContext();

	useEffect(() => {
		if (userList) {
			// Setup the map of users to their assignments' work weeks
			setUserAssignmentDataMap(processUserAssignmentDataMap(userList));

			// Clear the rowIdtoUserIdMap
			setRowIdtoUserIdMap(new Map());

			// Setup the map of row ids to user ids
			const newRowIdtoUserIdMap = new Map<number, number>();
			userList?.map((user: UserType, index: number) => {
				if (user.id && !newRowIdtoUserIdMap.has(index)) {
					newRowIdtoUserIdMap.set(index, user.id);
				}
			});

			setRowIdtoUserIdMap(newRowIdtoUserIdMap);
		}
	}, [userList]);

	const handleUserChange = (user: UserType) => {
		user.id && router.push(pathname + "/" + encodeURIComponent(user.id));
	};

	const renderCell = (
		cweek: number,
		year: number,
		rowIndex: number,
		isSelected: boolean,
		width?: number,
		height?: number
	) => {
		const userId = rowIdtoUserIdMap.get(rowIndex);

		if (userId) {
			const workWeeksForUser =
				getWorkWeeksForUserByWeekAndYear(
					userAssignmentDataMap,
					userId,
					cweek,
					year
				) ?? [];

			if (workWeeksForUser.length > 0) {
				return (
					<div className="relative absolute" style={{ height: height }}>
						{drawBars(workWeeksForUser, width, height)}
						{drawFTELabels(workWeeksForUser, width, height)}
					</div>
				);
			}
		}

		return <></>;
	};
	return (
		<>
			{userList ? (
				<WeekDisplay
					labelContentsLeft={userList?.map((user: UserType) => (
						<div
							className="flex gap-x-4 gap-y-4 items-center justify-center"
							key={user.id}
						>
							<div
								className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden"
							>
								<Image
									src={`${user.avatarUrl}`}
									alt="user avatar"
									width={500}
									height={500}
								/>
							</div>
							<div className="flex hover:cursor-pointer" onClick={() => handleUserChange(user)}>{user.name}</div>
							<div>
								<EllipsisPeopleMenu user={user} />
							</div>
						</div>
					))}
					renderCell={renderCell}
				/>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default withApollo(PeopleView);
