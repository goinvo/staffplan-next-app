"use client";
import React from "react";

const UsersList: React.FC<any> = (data: any) => {
	console.log(data);

	if (data && data.data && data.data.users) {
		const users = data.data.users;
		return (
			<div>
				<ul>
					{users.map((user: any) => {
						return (
							<li key={user.id}>
								{user.name}
								{user.assignments.map((assignment: any) => {
									return (
										<div className="ml-4" key={assignment.id}>
											{assignment.project.name}
										</div>
									);
								})}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	return (
		<div>
			<div>No users</div>
		</div>
	);
};

export default UsersList;
