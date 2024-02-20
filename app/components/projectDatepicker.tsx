import React, { useState } from "react";
interface ProjectDatepickerIf {
	projectDates: {
		id: number;
		name: string;
		startDate: string;
		endDate: string;
	};
}
export default function ProjctDatepicker({
	projectDates,
}: ProjectDatepickerIf) {
	const [dateValues, setDateValues] = useState({
		startDate: projectDates.startDate,
		endDate: projectDates.endDate,
	});
	const handleStartDateChange = (newDate: string) => {
		setDateValues({ ...dateValues, startDate: newDate });
	};
	const handleEndDateChange = (newDate: string) => {
		setDateValues({ ...dateValues, endDate: newDate });
	};
	const handleCoverDurationClick = () => {
		setDateValues({
			startDate: projectDates.startDate,
			endDate: projectDates.endDate,
		});
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
					value={dateValues.startDate}
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
					value={dateValues.endDate}
					onChange={(e) => handleEndDateChange(e.target.value)}
					/>
					</div>
			
		</div>
	);
}
