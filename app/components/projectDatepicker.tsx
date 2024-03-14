import React, { FocusEventHandler } from "react";
import { FieldProps } from "formik";
import { useSearchParams } from "next/navigation";
import { ProjectType } from "../typeInterfaces";

interface DatePickerProps extends FieldProps {
	selectedProject: ProjectType;
	handleBlur: FocusEventHandler;
}

export default function ProjctDatepicker(props: DatePickerProps) {
	const {
		field: { name, value, onChange },
		form: { setFieldValue },
		selectedProject,
		handleBlur,
	} = props;
	const searchParams = useSearchParams();
	const assignmentModal = searchParams.get("assignmentmodal");
	const projectModal = searchParams.get("projectmodal");

	const handleCoverDurationClick = () => {
		if (selectedProject.startsOn && selectedProject.endsOn) {
			setFieldValue(name, {
				startsOn: selectedProject.startsOn,
				endsOn: selectedProject.endsOn,
			});
		}
	};
	const handleEndDateProjectModal = () => {
		if (projectModal) {
			setFieldValue("hourlyRate", 0)
			setFieldValue("cost", 0)
		}
	};
	return (
		<div className="flex justify-between">
			<div className="w-48 mr-4">
				<label className="block mb-2">
					Start
					<input
						className="w-full px-4 py-2 border rounded-md"
						type="date"
						id="startDate"
						name={`${name}.startsOn`}
						value={value.startsOn}
						onChange={onChange}
						onBlur={handleBlur}
					/>
				</label>
				{assignmentModal ? (
					<button
						onClick={() => handleCoverDurationClick()}
						style={{ color: "teal" }}
						type="button"
						disabled={!selectedProject}
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
						className="w-full px-4 py-2 border rounded-md"
						type="date"
						id="endDate"
						name={`${name}.endsOn`}
						value={value.endsOn}
						onChange={(e) => {
							onChange(e);
							handleEndDateProjectModal()
						}}
						onBlur={handleBlur}
					/>
				</label>
			</div>
		</div>
	);
}
