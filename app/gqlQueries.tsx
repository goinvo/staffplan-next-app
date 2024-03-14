import { gql } from "@apollo/client";

//queries
export const GET_ASSIGNMENT_DATA = gql`
	{
		clients {
			id
			projects {
				id
				name
				status
				paymentFrequency
				startsOn
				endsOn
				users {
					id
					name
					companies {
						name
					}
				}
			}
		}
		users {
			id
			name
		}
	}
`;

export const GET_CLIENT_DATA = gql`
	{
		clients {
			description
			id
			name
			projects {
				id
				name
			}
			status
		}
	}
`;
export const GET_PROJECT_DATA = gql`
	{
		clients {
			id
			name
			projects {
				id
				name
				status
				paymentFrequency
				startsOn
				endsOn
				assignments {
					assignedUser {
						name
						id
					}
					endsOn
					startsOn
					status
				}
			}
		}
	}
`;

export const GET_USER_ASSIGNMENTS = gql`
	query getUserAssignments($selectedUserId: ID!) {
		userAssignments(userId: $selectedUserId) {
			id
			startsOn
			endsOn
			status
			assignedUser {
				name
				id
			}
			workWeeks {
				id
				actualHours
				assignmentId
				cweek
				estimatedHours
				year
			}
			project {
				name
				id
				client {
					name
				}
				startsOn
				endsOn
			}
		}
	}
`;
export const GET_USER_LIST = gql`
	{
		users {
			id
			name
		}
	}
`;

export const GET_ALL_PROJECTS_DATA = gql`
	{
	currentCompany{
		projects {
		id
		name
		client {
			name
		}
		workWeeks {
			actualHours
			estimatedHours
		}
		}
	}
	}
`;

//mutations
export const UPSERT_ASSIGNMENT = gql`
	mutation UpsertAssignment(
		$id: ID
		$projectId: ID!
		$userId: ID!
		$status: String!
		$startsOn: ISO8601Date
		$endsOn: ISO8601Date
	) {
		upsertAssignment(
			id: $id
			projectId: $projectId
			userId: $userId
			status: $status
			startsOn: $startsOn
			endsOn: $endsOn
		) {
			project {
				id
			}
			startsOn
			endsOn
			status
			assignedUser {
				id
			}
		}
	}
`;
export const UPSERT_PROJECT = gql`
	mutation UpsertProjectUpdate(
		$clientId: ID
		$name: String
		$status: String
		$startsOn: ISO8601Date
		$endsOn: ISO8601Date
	) {
		upsertProject(
			clientId: $clientId
			name: $name
			status: $status
			startsOn: $startsOn
			endsOn: $endsOn
		) {
			id
			client {
				id
				name
			}
			name
			status
			cost
			paymentFrequency
			startsOn
			endsOn
		}
	}
`;
export const UPSERT_WORKWEEK = gql`
	mutation UpsertWorkWeek(
		$assignmentId: ID!
		$cweek: Int!
		$year: Int!
		$estHours: Int
		$actHours: Int
	) {
		upsertWorkWeek(
			assignmentId: $assignmentId
			cweek: $cweek
			year: $year
			estimatedHours: $estHours
			actualHours: $actHours
		) {
			id
			assignmentId
			estimatedHours
			actualHours
			year
			cweek
		}
	}
`;

