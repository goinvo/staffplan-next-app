import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../app/components/navbar';
import { jest } from '@jest/globals';

type LinkProps = {
    href: string;
    children: ReactNode;
};

// Mock Next.js Link
jest.mock('next/link', () => ({
    __esModule: true, // Mock ESModule export
    default: ({ children, href, ...rest }: LinkProps) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

describe('Navbar', () => {
    it('renders the navbar correctly', () => {
        render(<Navbar />);

        // Check for navigation links
        const projectsLink = screen.getByText('Projects').closest('a');
        const peopleLink = screen.getByText('People').closest('a');

        // Assert the correct href for Projects link
        expect(projectsLink).toHaveAttribute('href', '/projects');

        // Assert the correct href for People link
        expect(peopleLink).toHaveAttribute('href', '/people');

        // Check for user greeting using a regex to allow any name
        expect(screen.getByText(/Hi, \w+!/)).toBeInTheDocument();
    });
});