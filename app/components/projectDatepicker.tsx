
import React, { SetStateAction, Dispatch } from "react";
import { ProjectType } from "./addAssignmentModal";

export default function ProjctDatepicker({
	projectDates,
	setDates,
}:{projectDates:ProjectType, setDates: Dispatch<SetStateAction<ProjectType>>}) {
	const handleStartDateChange = (newDate: string) => {
		setDates((project) => ({ ...project, startDate: newDate }));
	};
	const handleEndDateChange = (newDate: string) => {
		setDates((project) => ({ ...project, endDate: newDate }));
	};
	const handleCoverDurationClick = () => {
		if (projectDates) {
			setDates((project) => ({
				...project,
				startDate: projectDates.startDate,
				endDate: projectDates.endDate,
			}));
		}
	};
	return (
		<div className="flex justify-between">
			<div className="w-48">
				<label className="block mb-2">Start</label>
				<input
					className="w-full px-4 py-2 border rounded-md "
					type="date"
					id="startDate"
					name="project-start"
					value={projectDates.startDate  || ""}
					onChange={(e) => handleStartDateChange(e.target.value)}
				/>
				<span
					onClick={handleCoverDurationClick}
					style={{ color: "teal" }}
				>
					Cover Project Span
				</span>
			</div>
			<div className="w-48">
				<label className="block mb-2 ">End</label>
				<input
					className="w-full px-4 py-2 border rounded-md"
					type="date"
					id="endDate"
					name="project-end"
					value={projectDates?.endDate || ""}
					onChange={(e) => handleEndDateChange(e.target.value)}
				/>
			</div>
		</div>
	);
}
