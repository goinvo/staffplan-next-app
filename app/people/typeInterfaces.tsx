export interface AssignmentType {
	assignedUser: UserType;
	endsOn: string | null;
	id: number;
	project: ProjectType;
	startsOn: string | null;
	status: string;
	workWeeks: [];
}

export interface ClientType {
	description: string;
	id: number;
	name: string;
	projects?: [ProjectType];
}

export interface ProjectType {
	endsOn: string | null;
	id: number;
	name: string;
	paymentFrequency: string;
	startsOn: string | null;
	status: string;
	users: [];
	assignments?: [AssignmentType];
}

export interface ProjectValuesType {
	endsOn: string;
	hours: number;
	name: string;
	numOfFTE: string;
	numOfWeeks: string;
	startsOn: string;
	paymentFrequency: string;
	cost: number;
}
export interface UpsertValues {
	actualHours: number | string;
	estimatedHours: number | string;
	assignmentId: number;
	cweek: number;
	year: number;
}
export interface UserAssignmentDataType {
	userAssignments: AssignmentType[];
}
export interface UserType {
	id?: number;
	name: string;
}

export interface WorkWeekProps {
	workWeek: WorkWeekType;
}

export interface WorkWeekType {
	id?: number;
	actualHours?: number;
	estimatedHours?: number;
	assignmentId: number;
	cweek: number;
	year: number;
}
