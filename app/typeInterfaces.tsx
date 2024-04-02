import { ReactNode } from 'react';

export interface AssignmentType {
	assignedUser: UserType;
	endsOn: string | null;
	client: ClientType;
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

export interface EllipsisProjectMenuProps {
	project:Partial<ProjectType>
}
export interface ProjectType {
	endsOn: string | null;
	id: number;
	name: string;
	client: ClientType;
	paymentFrequency: string;
	startsOn: string | null;
	status: string;
	users: [];
	assignments?: [AssignmentType];
	__typename?:string;
	workWeeks?: WorkWeekType[];
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

export interface SVGAlphabetProps {
	name: string;
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
	assignments?: AssignmentType[];
}

export interface WorkWeekProps {
	workWeek: WorkWeekType;
}

export interface WorkWeekType {
	id?: number;
	actualHours?: number;
	estimatedHours?: number;
	project?: ProjectType;
	user?: UserType;
	assignmentId: number;
	cweek: number;
	year: number;
}

export interface WorkWeekBlockMemberType {
	workWeek: WorkWeekType;
	maxTotalEstHours: number;
	itemEstHoursOffset: number;
	consecutivePrevWeeks: number;
	isLastConsecutiveWeek: boolean;
}

export interface UserAssignmentDataMapType {
	[userId: number]: {
		[year: number]: {
			[cweek: number]: WorkWeekBlockMemberType[];
		};
	};
}

export interface ProjectDataMapType {
	[projectId: number]: {
		[year: number]: {
			[cweek: number]: WorkWeekBlockMemberType[];
		};
	};
}

export interface ViewerType { 
	name:string;
	id:string;
}

export interface WorkWeekRenderDataType {
	cweek: number;
	year: number;
	estimatedHours: number;
	actualHours: number;
	assignmentId?: number;
	workWeekBarId?: number;
}

export type WeekDisplayProps = {
    labelContentsLeft: React.ReactNode[];
	labelContentsRight?: React.ReactNode[];
    onMouseOverWeek?: (week: number, year: number, cellId: number) => void;
    onMouseClickWeek?: (week: number, year: number, cellId: number) => void;
    renderCell?: (week: number, year: number, cellId: number, isSelected: boolean, width?: number, height?: number) => ReactNode;
    selectedCell?: selectedCell;
};

export type selectedCell = {
    week: number;
    year: number;
    rowId: number;
};

export interface SideLabelComponentsType {
    labelContents: React.ReactNode[];
	onDivHeightsUpdate: (heights: number[]) => void;
    offset: number;
};