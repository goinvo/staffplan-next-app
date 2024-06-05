import { UserType, WorkWeekType } from "@/app/typeInterfaces";
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
interface Accumulator {
	[cweek: number]: {
		cweek: number;
		actualHours: number;
		estimatedHours: number;
		year: number;
	};
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

	const totalWorkWeekHours = Object.values(
		(user.assignments ?? []).reduce<Accumulator>((acc, assignment) => {
			assignment.workWeeks.forEach((workWeek) => {
				const cweek = workWeek.cweek;
				const actualHours = workWeek.actualHours ?? 0;
				const estimatedHours = workWeek.estimatedHours ?? 0;
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
	console.log(totalWorkWeekHours, "total actual hours");
	return (
		<div className="flex">
			{isFirstMonth && (
				<AllUserLabel clickHandler={handleUserChange} user={user} />
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-between w-full h-28">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const workWeekElements = totalWorkWeekHours.map(
						(workWeek, workWeekIndex) => {
							if (
								(workWeek as WorkWeekType).cweek === cweek &&
								(workWeek as any).year === mondays.year
							) {
								if ((workWeek as any).actualHours > 0) {
									return (
										<div
											key={`${cweek}has-actual-hours`}
											className="bg-red-200 w-4 h-4 rounded-full"
										>
											{(workWeek as any).actualHours}
										</div>
									);
								}
								if ((workWeek as any).actualHours <= 0) {
									return (
										<div
											key={`${cweek}${(workWeek as any).year}no-actual-hours`}
											className="bg-green-200 w-4 h-4 rounded-full"
										>
											{(workWeek as any).estimatedHours}
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
							{hasWorkWeek && (user.assignments ?? []).length > 0 ? (
								workWeekElements
							) : (
								<div key={`${cweek}HELLO`}>cweek{cweek}</div>
							)}
							{!hasWorkWeek && !user.assignments?.length ? (
								<div key={`${cweek}NOASSIGNMENTS`}>0</div>
							) : null}
						</div>
					);
				})}
			</div>
		</div>
	);
};
