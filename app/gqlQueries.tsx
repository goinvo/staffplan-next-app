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
			avatarUrl
		}
	}
`;

export const GET_CLIENT_DATA = gql`
	{
		clients {
			description
			id
			name
			status
			avatarUrl
		}
	}
`;
export const GET_PROJECT_DATA = gql`
	{
		clients {
			id
			name
			avatarUrl
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
						avatarUrl
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
	query getUserAssignments($userId: ID!) {
		userAssignments(userId: $userId) {
			id
			startsOn
			endsOn
			status
			assignedUser {
				name
				id
				avatarUrl
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
					avatarUrl
				}
				startsOn
				endsOn
			}
		}
	}
`;
export const GET_USER_LIST = gql`
	{
		currentCompany {
			id
			users {
				id
				name
				avatarUrl
				assignments {
					id
					project {
						id
						name
						client {
							id
							name
							avatarUrl
						}
					}

					workWeeks {
						project {
							name
						}
						actualHours
						estimatedHours
						cweek
						year
					}
				}
			}
		}
	}
`;

export const GET_ALL_PROJECTS_DATA = gql`
	{
		currentCompany {
			id
			projects {
				id
				name
				status
				paymentFrequency
				startsOn
				endsOn
				cost
				client {
					id
					name
					avatarUrl
				}
				workWeeks {
					actualHours
					estimatedHours
					cweek
					year
					user {
						name
					}
				}
			}
		}
	}
`;
export const GET_VIEWER = gql`
	{
		viewer {
			name
			id
			avatarUrl
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
		$estimatedWeeklyHours: Int
	) {
		upsertAssignment(
			id: $id
			projectId: $projectId
			userId: $userId
			status: $status
			startsOn: $startsOn
			endsOn: $endsOn
			estimatedWeeklyHours: $estimatedWeeklyHours
		) {
			id
			startsOn
			endsOn
			status
			estimatedWeeklyHours
			assignedUser {
				id
				name
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
					avatarUrl
				}
				startsOn
				endsOn
			}
		}
	}
`;

export const UPSERT_CLIENT = gql`
	mutation UpsertClient(
		$clientId: ID
		$name: String
		$description: String
		$status: String
	) {
		upsertClient(
			id: $clientId
			name: $name
			description: $description
			status: $status
		) {
			id
			name
			description
			status
			avatarUrl
		}
	}
`;

export const UPSERT_PROJECT = gql`
	mutation UpsertProjectUpdate(
		$id: ID
		$clientId: ID
		$name: String
		$status: String
		$startsOn: ISO8601Date
		$endsOn: ISO8601Date
		$cost: Float
	) {
		upsertProject(
			id: $id
			clientId: $clientId
			name: $name
			status: $status
			startsOn: $startsOn
			endsOn: $endsOn
			cost: $cost
		) {
			id
			client {
				id
				name
				avatarUrl
			}
			name
			status
			cost
			paymentFrequency
			startsOn
			endsOn
			workWeeks {
				actualHours
				estimatedHours
				cweek
				year
			}
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
