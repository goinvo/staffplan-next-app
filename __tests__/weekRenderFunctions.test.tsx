import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { matchWorkWeekBlocks } from '../app/helperFunctions';
import { WorkWeekBlockMemberType } from '../app/typeInterfaces';

// Test data
const prevBlocks: WorkWeekBlockMemberType[] = [
    {
        workWeek: {
            project: { name: 'Project A', id: 0 },
            assignmentId: 0,
            cweek: 7,
            year: 2024,
            actualHours: 0,
            estimatedHours: 40,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
    {
        workWeek: {
            project: { name: 'Project B', id: 1 },
            assignmentId: 1,
            cweek: 7,
            year: 2024,
            actualHours: 0,
            estimatedHours: 30,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
    {
        workWeek: {
            project: { name: 'Project C', id: 2 },
            assignmentId: 2,
            cweek: 7,
            year: 2024,
            actualHours: 0,
            estimatedHours: 20,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
];

const currentBlocks: WorkWeekBlockMemberType[] = [
    {
        workWeek: {
            project: { name: 'Project D', id: 3 },
            assignmentId: 3,
            cweek: 8,
            year: 2024,
            actualHours: 0,
            estimatedHours: 25,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
    {
        workWeek: {
            project: { name: 'Project B', id: 1 },
            assignmentId: 1,
            cweek: 8,
            year: 2024,
            actualHours: 0,
            estimatedHours: 30,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
    {
        workWeek: {
            project: { name: 'Project A', id: 0 },
            assignmentId: 0,
            cweek: 8,
            year: 2024,
            actualHours: 0,
            estimatedHours: 40,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
    {
        workWeek: {
            project: { name: 'Project E', id: 4 },
            assignmentId: 4,
            cweek: 8,
            year: 2024,
            actualHours: 0,
            estimatedHours: 15,
        },
        consecutivePrevWeeks: 0,
        isLastConsecutiveWeek: true,
        itemEstHoursOffset: 0,
        maxTotalEstHours: 40,
    },
];

// Test case 1: Match work week blocks in reverse order
test('matchWorkWeekBlocks should match blocks in reverse order', () => {
    const expectedOutput1: WorkWeekBlockMemberType[] = [
        {
            workWeek: {
                project: { name: 'Project E', id: 4 },
                assignmentId: 4,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 15,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project A', id: 0 },
                assignmentId: 0,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 40,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project B', id: 1 },
                assignmentId: 1,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 30,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project D', id: 3 },
                assignmentId: 3,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 25,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
    ];

    const expectedOutput2: WorkWeekBlockMemberType[] = [
        {
            workWeek: {
                project: { name: 'Project D', id: 3 },
                assignmentId: 3,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 25,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project A', id: 0 },
                assignmentId: 0,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 40,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project B', id: 1 },
                assignmentId: 1,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 30,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
        {
            workWeek: {
                project: { name: 'Project E', id: 4 },
                assignmentId: 4,
                cweek: 8,
                year: 2024,
                actualHours: 0,
                estimatedHours: 15,
            },
            consecutivePrevWeeks: 0,
            isLastConsecutiveWeek: true,
            itemEstHoursOffset: 0,
            maxTotalEstHours: 40,
        },
    ];

    const result = matchWorkWeekBlocks(prevBlocks, currentBlocks);
    expect(result).toEqual(expect.arrayContaining([expectedOutput1, expectedOutput2]));
});

// Test case 2: Handle empty previous blocks
test('matchWorkWeekBlocks should handle empty previous blocks', () => {
    const emptyPrevBlocks: WorkWeekBlockMemberType[] = [];
    const result = matchWorkWeekBlocks(emptyPrevBlocks, currentBlocks);
    expect(result).toEqual(currentBlocks);
});

// Test case 3: Handle empty current blocks
test('matchWorkWeekBlocks should handle empty current blocks', () => {
    const emptyCurrentBlocks: WorkWeekBlockMemberType[] = [];
    const result = matchWorkWeekBlocks(prevBlocks, emptyCurrentBlocks);
    expect(result).toEqual([]);
});