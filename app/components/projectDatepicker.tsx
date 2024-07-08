import React, { FocusEventHandler } from "react";
import { FieldProps } from "formik";
import { AssignmentType, ProjectType } from "../typeInterfaces";

interface DatePickerProps extends FieldProps {
	selectedAssignment: AssignmentType;
	selectedProject: ProjectType;
	handleBlur: FocusEventHandler;
	projectView: boolean;
	assignmentView: boolean;
}

export default function ProjectDatepicker(props: DatePickerProps) {
	const {
		field: { name, value, onChange },
		form: { setFieldValue },
		selectedProject,
		selectedAssignment,
		handleBlur,
		projectView,
		assignmentView,
	} = props;

	const handleCoverDurationClick = () => {
		if (selectedProject && selectedProject.startsOn && selectedProject.endsOn) {
			setFieldValue(name, {
				startsOn: selectedProject.startsOn,
				endsOn: selectedProject.endsOn,
			});
		}
		if (selectedAssignment && selectedAssignment.startsOn && selectedAssignment.endsOn) {
			setFieldValue(name, {
				startsOn: selectedAssignment.startsOn,
				endsOn: selectedAssignment.endsOn,
			});
		}
		if (selectedProject && selectedProject.startsOn && !selectedProject.endsOn) {
			setFieldValue(name, {
				startsOn: selectedProject.startsOn,
				endsOn: "",
			});
		}
		if (selectedAssignment && selectedAssignment.startsOn && !selectedAssignment.endsOn) {
			setFieldValue(name, {
				startsOn: selectedAssignment.startsOn,
				endsOn: "",
			});
		}
	};
	const handleEndDateProjectModal = () => {
		if (projectView) {
			setFieldValue("hourlyRate", 0);
			setFieldValue("cost", 0);
			setFieldValue("hours", 0);
			setFieldValue("numOfFTE", 0);
		}
	};
	return (
		<div className="flex justify-between">
			<div className="w-48 mr-4">
				<label className="block mb-2">
					Start
					<input
						className="w-full px-4 py-2 border rounded-md block border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
						type="date"
						id="startDate"
						name={`${name}.startsOn`}
						value={value.startsOn ?? ""}
						onChange={onChange}
						onBlur={handleBlur}
					/>
				</label>
				{assignmentView ? (
					<button
						onClick={() => handleCoverDurationClick()}
						style={{ color: "teal" }}
						type="button"
						disabled={!selectedAssignment && !selectedProject}
					>
						Cover Project Span
					</button>
				) : (
					""
				)}
			</div>
			<div className="w-48">
				<label className="block mb-2">
					End
					<input
						className="w-full px-4 py-2 border rounded-md block border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
						type="date"
						id="endDate"
						name={`${name}.endsOn`}
						value={value.endsOn ?? ""}
						onChange={(e) => {
							onChange(e);
							handleEndDateProjectModal();
						}}
						onBlur={handleBlur}
					/>
				</label>
			</div>
		</div>
	);
}
