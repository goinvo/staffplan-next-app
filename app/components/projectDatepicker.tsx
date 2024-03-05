import React, { SetStateAction, Dispatch, useState } from "react";
import { ProjectType, ProjectValuesType } from "./addProjectModal";
export interface DateType {
	startDate: string | null;
	endDate: string | null;
}
export default function ProjctDatepicker({
	selectedProject,
	setDates,
	setProjectModalDates,
	modalSource,
}: {
	selectedProject?: ProjectType;
	setDates?: Dispatch<SetStateAction<ProjectType>>;
	setProjectModalDates?: Dispatch<SetStateAction<ProjectValuesType>>;
	modalSource: string;
}) {
	const [projectDates, setProjectDates] = useState<DateType>({
		startDate: "",
		endDate: "",
	});
	const handleStartDateChange = (newDate: string) => {
		if (modalSource === "addAssignment" && setDates) {
			setDates((project: ProjectType) => ({ ...project, startsOn: newDate }));
			setProjectDates({ ...projectDates, startDate: newDate });
		}
		if (modalSource === "addProject" && setProjectModalDates) {
			setProjectModalDates((project: ProjectValuesType) => ({
				...project,
				startsOn: newDate,
			}));
			setProjectDates({ ...projectDates, startDate: newDate });
		}
	};
	const handleEndDateChange = (newDate: string) => {
		if (modalSource === "addAssignment" && setDates) {
			setDates((project: ProjectType) => ({ ...project, endsOn: newDate }));
			setProjectDates({ ...projectDates, endDate: newDate });
		}
		if (modalSource === "addProject" && setProjectModalDates) {
			setProjectModalDates((project: ProjectValuesType) => ({
				...project,
				endsOn: newDate,
			}));
			setProjectDates({ ...projectDates, endDate: newDate });
		}
	};
	const handleCoverDurationClick = () => {
		if (selectedProject && setDates) {
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
    <div className="w-48 mr-4">
        <label className="block mb-2">Start</label>
        <input
            className="w-full px-4 py-2 border rounded-md"
            type="date"
            id="startDate"
            name="project-start"
            value={projectDates.startDate || ""}
            onChange={(e) => handleStartDateChange(e.target.value)}
        />
        {modalSource === "addAssignment" ? (
            <span onClick={handleCoverDurationClick} style={{ color: "teal" }}>
                Cover Project Span
            </span>
        ) : (
            ""
        )}
    </div>
    <div className="w-48">
        <label className="block mb-2">End</label>
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
