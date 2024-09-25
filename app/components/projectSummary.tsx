import React from 'react';
import { DateTime } from 'luxon';
import { ProjectSummaryProps } from '../typeInterfaces';
import { useUserDataContext } from '../userDataContext';
import IconButton from './iconButton';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { IoDownloadOutline } from "react-icons/io5";
import { UPSERT_PROJECT } from "@/app/gqlQueries";
import { useMutation } from "@apollo/client";
import { convertToCSV } from '../helperFunctions';


const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const { viewsFilter, refetchProjectList } = useUserDataContext();

	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			refetchProjectList();
		},
	});


	const handleArchiveItemClick = () => {
		if (project.status !== 'archived') {
			const variables = {
				id: project.id,
				name: project.name,
				clientId: project.client.id,
				status: 'archived'
			};
			upsertProject({
				variables
			})
		}
	}


	const plannedHours = project.assignments?.reduce((acc, curr) => {
		if (curr.status === 'active') {
			return acc + curr.estimatedWeeklyHours;
		}
		return acc;
	}, 0);

	const weeks = () => {
		if (project.startsOn && project.endsOn) {
			const startsOn = DateTime.fromISO(project.startsOn);
			const endsOn = DateTime.fromISO(project.endsOn);
			return Math.round(endsOn.diff(startsOn, 'weeks').weeks);
		}
		return 0;
	};

	const burnedHours = project.workWeeks?.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	) || 0;

	const shortHours = () => {
		if (project.hours) {
			return project.hours - ((burnedHours ?? 0) + (plannedHours ?? 0));
		}
	};

	const downloadCSV = () => {
		const csv = convertToCSV(project);
		console.log(project, 'project')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${project.name}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<td className="font-normal py-2 pr-4 pl-0 w-1/6 flex justify-center items-center">
			{viewsFilter.showSummaries ? (
				<div className="flex flex-col items-start">
					<div className="ml-auto">
						<IconButton
							className="text-black text-transparentGrey"
							onClick={() => handleArchiveItemClick()}
							Icon={ArchiveBoxIcon}
							iconSize="h6 w-6"
						/>
					</div>
					{project.fte ? (
						<span className="text-sm flex items-center">
							<span className="font-bold text-sm px-1">{project.fte}</span>
							FTE
						</span>
					) : null}
					{weeks() ? (
						<span className="text-sm flex items-center">
							<span className="font-bold text-sm px-1">{weeks()}</span>
							wks
						</span>
					) : null}
					{project.hours ? (
						<div className="flex justify-between">
							<label className="text-sm">target</label>
							<span className="font-bold text-sm px-1">
								{project.hours}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
					<div className="flex">
						<label className="text-sm">planned</label>
						<span className="font-bold text-sm px-1">
							{plannedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					<div className="flex">
						<label className="text-sm">burned</label>
						<span className="font-bold text-sm px-1">
							{burnedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					{shortHours() ? (
						<div className="flex">
							<label className="text-sm">short</label>
							<span className="font-bold text-sm px-1">
								{shortHours()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
				</div>
			) : null}
			<IconButton Icon={IoDownloadOutline} className="text-transparentGrey ml-6" iconSize='h-7 w-7' onClick={downloadCSV} />
		</td>
	);
};

export default ProjectSummary;
