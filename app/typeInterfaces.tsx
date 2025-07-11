import { ReactNode, RefObject } from "react";

export interface AllUserLabelProps {
	user: UserType;
	clickHandler: (user: UserType) => void;
}
export interface AllUserRowProps {
	user: UserType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
	months?: MonthsDataType[]
}
export interface AllUserAccumulatorProps {
	[cweek: number]: {
		cweek: number;
		actualHours: number;
		estimatedHours: number;
		year: number;
	};
}
export interface AllProjectLabelProps {
    project: ProjectType;
    isNewClient: boolean;
    clickHandler: (project: ProjectType) => void;
    handleUnarchiveProject: (project: ProjectType) => void;
    undoRowRef: RefObject<HTMLTableRowElement | null>;
}

export interface AllProjectRowProps {
	project: ProjectType;
	projects: ProjectType[];
	rowIndex: number;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
	months?: MonthsDataType[]
}
export interface AssignmentType {
	assignedUser: UserType;
	canBeDeleted: boolean;
	endsOn: string | null;
	client: ClientType;
	id: number;
	project: ProjectType;
	startsOn: string | null;
	status: string;
	focused: boolean;
	workWeeks: WorkWeekType[];
	estimatedWeeklyHours: number;
}

export interface AssignmentEditDrawerProps {
	assignment: AssignmentType;
}

export interface ClientType {
	description: string;
	id: number;
	name: string;
	projects?: [ProjectType];
	avatarUrl: string;
}

export interface EllipsisProjectMenuProps {
	project: Partial<ProjectType>;
}
export interface ProjectType {
	isTempProject?: boolean;
	endsOn: string | null;
	id: number;
	name: string;
	client: ClientType;
	paymentFrequency: string;
	startsOn: string | null;
	status: string;
	users: [];
	assignments?: AssignmentType[];
	__typename?: string;
	workWeeks?: WorkWeekType[];
	fte: number;
	hours: number;
	rateType?: string,
	hourlyRate?: number,
	cost?: number
}

export interface ProjectSummaryProps {
	project: ProjectType;
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

export interface ProjectDataMapType {
	[projectId: number]: {
		[year: number]: {
			[cweek: number]: WorkWeekBlockMemberType[];
		};
	};
}

export type selectedCell = {
	week: number;
	year: number;
	rowId: number;
};

export interface SideLabelComponentsType {
	labelContents: React.ReactNode[];
	divHeights?: number[];
	setDivHeights: (heights: number[]) => void;
	offset: number;
	drawerIndex: number;
	drawerHeight: number;
}

export interface SideListItemType {
	labelIndex: number;
	labelContent: React.ReactNode;
	divHeight: number | null;
	divRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
	setDivHeights: (heights: number[]) => void;
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
	assignments: AssignmentType[];
	avatarUrl: string;
	isActive: boolean;
}

export interface UserAssignmentDataMapType {
	[userId: number]: {
		[year: number]: {
			[cweek: number]: WorkWeekBlockMemberType[];
		};
	};
}
export interface UserLabelProps {
	project?: ProjectType;
	assignment: AssignmentType;
	selectedUser: UserType;
	clickHandler: (assignment: AssignmentType) => void;
	undoRowRef: RefObject<HTMLTableRowElement | null>;
	isFirstClient?: boolean;
}
export interface ProjectLabelProps {
    project?: ProjectType;
    assignment: AssignmentType;
    clickHandler: (assignment: AssignmentType) => void;
    undoRowRef: RefObject<HTMLTableRowElement | null>;
}
export interface ClientLabelProps {
	assignment: AssignmentType;
}
export interface UserOptionType {
	value: string;
	label: string;
	avatarUrl: string;
}

export interface UserSummaryProps {
	assignment: AssignmentType;
	selectedUser?: UserType;
	project?: ProjectType;
}
export interface ViewerType {
	name: string;
	id: string;
	email: string;
	role: string;
}

export interface ViewsFiltersType {
	selectedProjectSort: string;
	selectedUserSort: string;
	singleUserSort: string;
	singleProjectSort: string;
	assignmentSort: string;
	rollupSort: string;
	showSummaries: boolean;
	showArchivedProjects: boolean;
	showArchivedAssignments: boolean;
	showInactiveUsers: boolean;
}

export type WeekDisplayProps = {
	labelContentsLeft: React.ReactNode[];
	labelContentsRight?: React.ReactNode[];
	onMouseOverWeek?: (week: number, year: number, cellId: number) => void;
	onMouseClickWeek?: (week: number, year: number, cellId: number) => void;
	onCellFocus?: (week: number, year: number, cellId: number) => void;
	onCellBlur?: (week: number, year: number, cellId: number) => void;
	renderCell?: (
		week: number,
		year: number,
		cellId: number,
		isSelected: boolean,
		width?: number,
		height?: number
	) => ReactNode;
	selectedCell?: selectedCell;
	drawerContents?: React.ReactNode;
	drawerIndex?: number;
};

export interface WorkWeekRenderDataType {
	cweek: number;
	year: number;
	estimatedHours: number;
	actualHours: number;
	assignmentId?: number;
	workWeekBarId?: number;
}

export interface WorkWeekProps {
	workWeek: WorkWeekType;
}

export interface WorkWeekType {
  	isDeleted?: boolean;
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

export interface MonthsDataType {
	monthLabel: string;
	year: number;
	weeks: {
		weekStartDate: number;
		weekNumberOfTheYear: number,
		weekNumberOfTheMonth: number,
	}[]
}

export interface UndoableModifiedAssignment {
	assignment: AssignmentType;
	timerId: NodeJS.Timeout;
	undoAction?: (assignments: UndoableModifiedAssignment[]) => void;
	actionType?: string;
	finalApiCall?: () => void;
}

export interface UndoableModifiedProject {
	project: ProjectType;
	timerId: NodeJS.Timeout;
	undoAction?: (projects: UndoableModifiedProject[]) => void;
	actionType?: string;
	finalApiCall?: () => void;
}

export type ClassValue = string | undefined | { [key: string]: boolean };

export type ProjectSummaryInfoItem = {
	label: string;
	value?: string | number;
	show: boolean;
	tooltip?: string;
};
