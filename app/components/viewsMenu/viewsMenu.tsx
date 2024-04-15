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
	const singleViewParam = () => {
		if (params) {
			if (params.name) {
				const decodedString = decodeURIComponent(params.name.toString());
				return JSON.parse(decodedString);
			}
		}
		return null;
	};
	const currentOpenTab = pathname.split("/")[1];
	return (
		<>
			{singleViewParam() && singleViewParam().selectedUserId ? (
				<SingleUserSortOptions />
			) : null}
			{singleViewParam() && singleViewParam().selectedProjectId ? (
				<SingleProjectSortOptions />
			) : null}
			{!singleViewParam() && currentOpenTab === "projects" ? (
				<ProjectSortOptions />
			) : null}
			{!singleViewParam() && currentOpenTab === "people" ? (
				<PeopleSortOptions />
			) : null}
		</>
	);
}
