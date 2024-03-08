import React from "react";
import { FieldProps } from "formik";

export default function ProjctDatepicker({ field: { name, value, onChange } }:FieldProps) {
	return (
		<div className="flex justify-between">
			<div className="w-48 mr-4">
				<label className="block mb-2">Start
				<input
					className="w-full px-4 py-2 border rounded-md"
					type="date"
					id="startDate"
					name={`${name}.startsOn`}
					value={value.startsOn}
					onChange={onChange}
				/>
				</label>
				{/* {modalSource === "addAssignment" ? (
					// <span onClick={handleCoverDurationClick} style={{ color: "teal" }}>
					// 	Cover Project Span
					// </span>
				) : (
					""
				)} */}
			</div>
			<div className="w-48">
				<label className="block mb-2">End
				<input
					className="w-full px-4 py-2 border rounded-md"
					type="date"
					id="endDate"
					name={`${name}.endsOn`}
					value={value.endsOn}
					onChange={onChange}
				/>
				</label>
			</div>
		</div>
	);
}
