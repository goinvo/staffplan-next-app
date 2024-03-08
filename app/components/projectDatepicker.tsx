import React, { SetStateAction, Dispatch, useState } from "react";
import { ProjectType } from "./addAssignmentModal";

interface DateType {
	startDate: string | null;
	endDate: string | null;
}
export default function ProjctDatepicker({
	selectedProject,
	setDates,
}: {
	selectedProject: ProjectType;
	setDates: Dispatch<SetStateAction<ProjectType>>;
}) {
	const [projectDates, setProjectDates] = useState<DateType>({
		startDate: "",
		endDate: "",
	});
	const handleStartDateChange = (newDate: string) => {
		setDates((project) => ({ ...project, startsOn: newDate }));
		setProjectDates({ ...projectDates, startDate: newDate });
	};
	const handleEndDateChange = (newDate: string) => {
		setDates((project) => ({ ...project, endsOn: newDate }));
		setProjectDates({ ...projectDates, endDate: newDate });
	};
	const handleCoverDurationClick = () => {
		if (selectedProject) {
			setDates((project) => ({
				...project,
				startDate: selectedProject.startsOn,
				endDate: selectedProject.endsOn,
			}));
			setProjectDates({
				startDate: selectedProject.startsOn,
				endDate: selectedProject.endsOn,
			});
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
					value={projectDates.startDate || ""}
					onChange={(e) => handleStartDateChange(e.target.value)}
				/>
				<span onClick={handleCoverDurationClick} style={{ color: "teal" }}>
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
					value={projectDates.endDate || ""}
					onChange={(e) => handleEndDateChange(e.target.value)}
				/>
			</div>
		</div>
	);
}
