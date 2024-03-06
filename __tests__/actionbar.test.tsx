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
    beforeEach(() => {
      render(<ActionBar />);
    });
  
    it('renders the action bar with all elements', () => {
      // Check if AddDropdown is rendered
      expect(screen.getByTestId('add-dropdown')).toBeInTheDocument();
  
      // Check for icons by querying for their labels
      expect(screen.getByLabelText('sort amount down')).toBeInTheDocument();
      expect(screen.getByLabelText('expand')).toBeInTheDocument();
      expect(screen.getByLabelText('filter')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  
      // Assert the presence of Quarter and Year toggles by their text
      expect(screen.getByText('Quarter')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });
  });
  