import { UserType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import { getMondays } from "../weekDisplayPrototype/helpers";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { AllUserLabel } from "./allUserLabel";

interface AllUserRowProps {
	user: UserType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
}
export const AllUserRow = ({
	user,
	isFirstMonth,
	isLastMonth,
	monthData,
}: AllUserRowProps) => {
	const router = useRouter();
	const { dateRange } = useUserDataContext();
	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
	const handleUserChange = (user: UserType) => {
		if (user.id) {
			router.push("/people/" + encodeURIComponent(user.id));
		}
	};

	const totalActualWeekHours = Object.values(
		(user.assignments ?? []).reduce((acc, assignment) => {
			assignment.workWeeks.forEach((workWeek) => {
				const cweek = workWeek.cweek;
				const actualHours = workWeek.actualHours;
				const estimatedHours = workWeek.estimatedHours;
				if (!acc[cweek]) {
					acc[cweek] = {
						cweek,
						actualHours: 0,
						estimatedHours: 0,
						year: workWeek.year,
					};
				}
				acc[cweek].actualHours += actualHours;
				acc[cweek].estimatedHours += estimatedHours;
			});
			return acc;
		}, {})
	);
    console.log(user, "USER")
	return (
		<div className="flex">
			{isFirstMonth && (
				<AllUserLabel clickHandler={handleUserChange} user={user} />
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-between w-full h-28">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const workWeekElements = totalActualWeekHours.map(
						(workWeek, workWeekIndex) => {
							if (workWeek.cweek === cweek && workWeek.year === mondays.year) {
								if (workWeek.actualHours > 0) {
									return (
										<div
											key={`${cweek}has-actual-hours`}
											className="bg-green-200 w-4 h-4 rounded-full"
										>
											{workWeek.actualHours}
										</div>
									);
								}
								if (workWeek.actualHours <= 0) {
									return (
										<div
											key={`${cweek}${workWeek.year}no-actual-hours`}
											className="bg-red-200 w-4 h-4 rounded-full"
										>
											{workWeek.estimatedHours}
										</div>
									);
								}
							}
							return null;
						}
					);

					const hasWorkWeek = workWeekElements.some(
						(element) => element !== null
					);

					return (
						<div
							key={`cweek-${cweekIndex}`}
							className="flex-1 flex flex-col items-center"
						>
							{hasWorkWeek ? (
								workWeekElements
							) : (
								<div key={`${cweek}HELLO`}>cweek{cweek}</div>
							)}
                            {!user.assignments.length ? (
                                <div key={`${cweek}NOASSIGNMENTS`}>0</div>
                            ) : (
                               null
                            
                            )}
						</div>
					);
				})}
			</div>
		</div>
	);
};
