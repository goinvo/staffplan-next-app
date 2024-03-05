import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionBar from '../app/components/actionbar';
import { jest } from '@jest/globals';

// Mock AddDropdown component
jest.mock("../app/components/addDropdown", () => ({
    __esModule: true,
    default: () => <div data-testid="add-dropdown">Mocked Dropdown</div>,
  }));
  

describe('ActionBar', () => {
  it('renders the action bar with all elements', () => {
    render(<ActionBar />);

    // Check if AddDropdown is rendered
    // Note: This assumes AddDropdown renders a distinguishable text or role, adjust as necessary
    expect(screen.getByTestId('add-dropdown')).toBeInTheDocument();

    // Check for icons
    expect(screen.getByLabelText('sort amount down')).toBeInTheDocument(); // Assuming you add `aria-label="sort amount down"` to FaSortAmountDown icon
    expect(screen.getByLabelText('expand')).toBeInTheDocument(); // Adjust based on actual implementation
    expect(screen.getByLabelText('filter')).toBeInTheDocument();
    expect(screen.getByLabelText('search')).toBeInTheDocument();

    // Check for specific text elements
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Quarter')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  // Additional tests for interactions or specific logic
});
