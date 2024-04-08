import { sortProjectList, sortUserList, getWorkWeeksForProjectByWeekAndYear, getWorkWeeksForUserByWeekAndYear, processProjectDataMap, processUserAssignmentDataMap } from '../app/helperFunctions';
import { ProjectType, UserType, AssignmentType, ProjectDataMapType, UserAssignmentDataMapType } from '../app/typeInterfaces';

// Mock data for testing
const projectList: ProjectType[] = [
  { id: 1, name: 'Project C', status: 'active', startsOn: '2023-06-01', endsOn: null, client: { id: 1, name: 'Client 1', description: '', avatarUrl: '' }, paymentFrequency: 'monthly', users: [] },
  { id: 2, name: 'Project A', status: 'completed', startsOn: '2023-01-01', endsOn: null, client: { id: 2, name: 'Client 2', description: '', avatarUrl: '' }, paymentFrequency: 'weekly', users: [] },
  { id: 3, name: 'Project B', status: 'active', startsOn: '2023-03-01', endsOn: null, client: { id: 3, name: 'Client 3', description: '', avatarUrl: '' }, paymentFrequency: 'biweekly', users: [] },
];

const assignmentList: AssignmentType[] = [
    { estimatedWeeklyHours: 10, startsOn: '2023-06-01', endsOn: '2023-08-01', assignedUser: { name: "User C", avatarUrl: '' }, client: { name: "Client 3", description: "", avatarUrl: "", id: 3 }, id: 3, project: projectList[2], status: "proposed", workWeeks: [] },
    { estimatedWeeklyHours: 20, startsOn: '2023-01-01', endsOn: '2023-03-01', assignedUser: { name: "User A", avatarUrl: '' }, client: { name: "Client 1", description: "", avatarUrl: "", id: 1 }, id: 1, project: projectList[0], status: "confirmed", workWeeks: [] },
    { estimatedWeeklyHours: 15, startsOn: '2023-04-01', endsOn: '2023-06-01', assignedUser: { name: "User B", avatarUrl: '' }, client: { name: "Client 2", description: "", avatarUrl: "", id: 2 }, id: 2, project: projectList[1], status: "proposed", workWeeks: [] },
];

const userList: UserType[] = [
  { id: 1, name: 'User C', assignments: [assignmentList[0]], avatarUrl: '' },
  { id: 2, name: 'User A', assignments: [assignmentList[1]], avatarUrl: '' },
  { id: 3, name: 'User B', assignments: [assignmentList[2]], avatarUrl: '' },
];

const projectDataMap: ProjectDataMapType = processProjectDataMap(projectList);
const userAssignmentDataMap: UserAssignmentDataMapType = processUserAssignmentDataMap(userList);

describe('sortProjectList', () => {
  test('sorts projects by name in ascending order', () => {
    const sortedProjects = sortProjectList('abcProjectName', projectList);
    expect(sortedProjects?.map((project) => project.name)).toEqual(['Project A', 'Project B', 'Project C']);
  });

  test('sorts projects by status', () => {
    const sortedProjects = sortProjectList('status', projectList);
    expect(sortedProjects?.map((project) => project.status)).toEqual(['active', 'active', 'completed']);
  });

  test('sorts projects by start date', () => {
    const sortedProjects = sortProjectList('startDate', projectList);
    expect(sortedProjects?.map((project) => project.startsOn)).toEqual(['2023-01-01', '2023-03-01', '2023-06-01']);
  });

  test('returns original array for unsupported sort method', () => {
    const sortedProjects = sortProjectList('staffingNeeds', projectList);
    expect(sortedProjects).toEqual(projectList);
  });
});

describe('sortUserList', () => {
  test('sorts users by name in ascending order', () => {
    const sortedUsers = sortUserList('abcUserName', userList);
    expect(sortedUsers.map((user) => user.name)).toEqual(['User A', 'User B', 'User C']);
  });

  test('sorts users by availability', () => {
    const sortedUsers = sortUserList('userAvailability', userList);
    expect(sortedUsers.map((user) => user.name)).toEqual(['User A', 'User B', 'User C']);
  });

  test('sorts users by unconfirmed plans', () => {
    const modifiedUserList: UserType[] = [
      { id: 1, name: 'User C', assignments: [assignmentList[0]], avatarUrl: '' },
      { id: 2, name: 'User A', assignments: [assignmentList[1]], avatarUrl: '' },
      { id: 3, name: 'User B', assignments: [assignmentList[2]], avatarUrl: '' },
    ];
    const sortedUsers = sortUserList('unconfirmedPlans', modifiedUserList);
    expect(sortedUsers.map((user) => user.name)).toEqual(['User B', 'User C', 'User A']);
  });
});

describe('getWorkWeeksForProjectByWeekAndYear', () => {
  test('returns work weeks for a project by week and year', () => {
    const workWeeks = getWorkWeeksForProjectByWeekAndYear(projectDataMap, 1, 23, 2023);
    expect(workWeeks).toEqual([{ workWeek: { year: 2023, cweek: 23 }, maxTotalEstHours: 40, itemEstHoursOffset: 0, consecutivePrevWeeks: 0, isLastConsecutiveWeek: true }]);
  });

  test('returns an empty array if no work weeks are found', () => {
    const workWeeks = getWorkWeeksForProjectByWeekAndYear(projectDataMap, 1, 24, 2023);
    expect(workWeeks).toEqual([]);
  });
});

describe('getWorkWeeksForUserByWeekAndYear', () => {
  test('returns work weeks for a user by week and year', () => {
    const workWeeks = getWorkWeeksForUserByWeekAndYear(userAssignmentDataMap, 1, 23, 2023);
    expect(workWeeks).toEqual([{ workWeek: { year: 2023, cweek: 23 }, maxTotalEstHours: 40, itemEstHoursOffset: 0, consecutivePrevWeeks: 0, isLastConsecutiveWeek: true }]);
  });

  test('returns an empty array if no work weeks are found', () => {
    const workWeeks = getWorkWeeksForUserByWeekAndYear(userAssignmentDataMap, 1, 24, 2023);
    expect(workWeeks).toEqual([]);
  });
});