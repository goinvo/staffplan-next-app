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
	getWorkWeeksForUserByWeekAndYearForUsers,
	drawBars,
	drawFTELabels,
} from "../helperFunctions";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import Image from "next/image";
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
			// Setup the map of row ids to user ids
			userList?.map((user: UserType, index: number) => {
				if (user.id && !rowIdtoUserIdMap.has(index)) {
					rowIdtoUserIdMap.set(index, user.id);
				}
			});
		}
	}, [userList]);

	const handleUserChange = (user: UserType) => {
		const userId = JSON.stringify({ selectedUserId: user.id });
		const encodeUserId = Buffer.from(userId).toString("base64");
		router.push(pathname + "/" + encodeURIComponent(encodeUserId));
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
				getWorkWeeksForUserByWeekAndYearForUsers(
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
					labelContents={userList?.map((user: UserType) => (
						<div
							className="flex gap-x-4 gap-y-4 items-center justify-center"
							key={user.id}
						>
							<div
								className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden"
								onClick={() => handleUserChange(user)}
							>
								<Image
									src={`${user.avatarUrl}`}
									alt="user avatar"
									width={500}
									height={500}
								/>
							</div>
							<div className="flex">{user.name}</div>
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
