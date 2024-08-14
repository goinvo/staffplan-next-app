import { AssignmentType } from "@/app/typeInterfaces";
import Image from "next/image";
import React from "react";

interface TempLabelProps {
	assignment: AssignmentType;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const TempProjectLabel = ({ assignment, tempProjectOpen, setTempProjectOpen }: TempLabelProps) => {
	// const newProjectInitialValues = {
	// 	client: "",
	// 	cost: 0,
	// 	dates: { endsOn: "", startsOn: "" },
	// 	hourlyRate: 0,
	// 	hours: 0,
	// 	name: "",
	// 	numOfFTE: 0,
	// 	rateType: "fixed",
	// 	status: false,
	// };
	// const initialValues = parsedProject
	// 	? editProjectInitialValues
	// 	: newProjectInitialValues;

	// const [upsertProject] = useMutation(UPSERT_PROJECT, {
	// 	errorPolicy: "all",
	// 	onCompleted({ upsertProject }) {
	// 		refetchProjectList();
	// 	},
	// });

	// const onSubmitUpsert = (values: FormikValues) => {
	// 	const variables = {
	// 		id: values.id,
	// 		clientId: values.client,
	// 		name: values.name,
	// 		status: values.status ? "confirmed" : "unconfirmed",
	// 		cost: values.cost,
	// 		fte: values.numOfFTE,
	// 		hours: values.hours,
	// 		rateType: values.rateType,
	// 		hourlyRate: values.hourlyRate,
	// 	};
	// 	const nullableDates = () => {
	// 		if (values.dates.startsOn && values.dates.endsOn) {
	// 			return {
	// 				...variables,
	// 				endsOn: values.dates.endsOn,
	// 				startsOn: values.dates.startsOn,
	// 			};
	// 		}
	// 		if (values.dates.startsOn && !values.dates.endsOn) {
	// 			return { ...variables, startsOn: values.dates.startsOn };
	// 		}
	// 		if (!values.dates.startsOn && values.dates.endsOn) {
	// 			return { ...variables, endsOn: values.dates.endsOn };
	// 		}
	// 		return variables;
	// 	};
	// 	upsertProject({
	// 		variables: nullableDates(),
	// 	}).then(() => router.back());
	// };
	return (
		<div
			className="hover:cursor-pointer w-40 absolute left-10 mt-5 overflow-hidden"
		>
			<div className=" flex w-12 h-12 timeline-grid-bg rounded-full overflow-hidden">
				<Image
					src={`${assignment.project.client.avatarUrl}`}
					alt="client avatar"
					width={500}
					height={500}
				/>
			</div>
			<div
				className="hover:cursor-pointer"
			>
				<input/>
			</div>
			{assignment.status === "active" ? null : (
				<div className="text-red-500 text-sm"> Unconfirmed<br/> Assignment</div>
			)}
		</div>
	);
};
