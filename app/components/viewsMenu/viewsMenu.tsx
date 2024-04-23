"use client";
import React from "react";
import { usePathname, useParams } from "next/navigation";
import { ProjectSortOptions } from "./projectSortOptions";
import { PeopleSortOptions } from "./peopleSortOptions";
import { SingleProjectSortOptions } from "./singleProjectSortOptions";
import { SingleUserSortOptions } from "./singleUserSortOptions";

export default function ViewsMenu() {
	const pathname = usePathname();
	const params = useParams();
	const currentOpenTab = pathname.split("/")[1];
	return (
		<>
			{params && params.userId ? (
				<SingleUserSortOptions />
			) : null}
			{params && params.projectId ? (
				<SingleProjectSortOptions />
			) : null}
			{currentOpenTab === "projects" && !params.projectId ? (
				<ProjectSortOptions />
			) : null}
			{currentOpenTab === "people" && !params.userId ? (
				<PeopleSortOptions />
			) : null}
		</>
	);
}
