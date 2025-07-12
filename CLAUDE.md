# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 8080)
- **Build**: `npm run build`
- **Production server**: `npm start` (runs on port 8080)
- **Linting**: `npm run lint`
- **Testing**: `npm test` (uses Jest with jsdom environment)

## Architecture Overview

**StaffPlan** is a Next.js 14 application for staff planning and project management. It uses React 18 with TypeScript and connects to a GraphQL backend via Apollo Client.

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **GraphQL**: Apollo Client with custom middleware for CSRF handling
- **Testing**: Jest with @swc/jest transformer and jsdom environment
- **Form handling**: Formik
- **Date handling**: Luxon, date-fns, dayjs

### Key Architecture Patterns

**Data Management**:
- Apollo Client for GraphQL operations with `no-cache` fetch policy
- Context providers for global state management (General, Client, Project, User, Modal contexts)
- Custom Apollo setup with CSRF token middleware and error handling (`lib/apollo-client.ts`)

**Component Structure**:
- Route-based organization under `app/` directory using Next.js 13+ app router
- Shared components in `app/components/`
- Specialized component folders: `allProjects/`, `allUsers/`, `projectAssignment/`, `userAssignment/`, `scrollingCalendar/`, `viewsMenu/`

**Data Flow**:
- GraphQL queries/mutations centralized in `app/gqlQueries.tsx`
- TypeScript interfaces defined in `app/typeInterfaces.tsx`
- Main data models: `UserType`, `ProjectType`, `AssignmentType`, `ClientType`, `WorkWeekType`

### Core Features
- **Weekly time tracking**: Central concept using calendar weeks (`cweek`) and years
- **Assignment management**: Users assigned to projects with estimated/actual hours per week
- **Project and client management**: Hierarchical organization with status tracking
- **Filtering and sorting**: Multiple view options for projects, users, and assignments
- **Undo functionality**: Undoable modifications with timer-based auto-commit

### Custom Hooks
Located in `app/hooks/`:
- `useDynamicWeeks.tsx`: Dynamic week range calculation
- `useTaskQueue.ts`: Task queuing for API operations
- `useKeyboardNavigation.tsx`: Keyboard shortcuts
- `useIsMobileWidth.tsx`: Responsive design utilities

### Calendar System
The scrolling calendar (`app/components/scrollingCalendar/`) is a core feature that:
- Displays weeks in a horizontal scrolling interface
- Handles work week input and visualization
- Manages date ranges dynamically
- Supports both estimated and actual hours tracking

### Testing
- Tests located in `__tests__/` directory
- Mocks in `__mocks__/` for static assets and Next.js fonts
- Uses @swc/jest for fast TypeScript compilation
- jsdom environment for React component testing

### Environment & Deployment
- Configurable GraphQL API URI via `NEXT_PUBLIC_GRAPHQL_API_URI`
- CSRF token handling for authentication
- Port 8080 for both development and production