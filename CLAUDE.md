# PayID Banking App - BDD/TDD Demo Project

## Project Overview

This is a demonstration application showing BDD and TDD practices on a React application using TypeScript, Vite, Vitest, and CucumberJS. The app implements a searchable PayID address book as part of an online banking system.

## Main Feature

Searching for a saved Payee in the user's PayID address book using name, nickname, or PayID (email, mobile number, or ABN).

## User Journey

The main user journey is:

- Bonnie (a retail banking customer) logs into her account (using a hardcoded ID and password for demo purposes).
- She lands on the "Saved Payees" page.
- She sees a search field and a list of saved payees.
- She types a search term (e.g. "Lexi", "0412 784 539", or "80123456789").
- If there is a matching payee, it is shown in the results.
- If more than 3 characters are entered, a dropdown of matching **payee names** appears (max 10).
- If no matches are found, a “no results” message is shown.

## Business Rules Covered

- Search should match on:
  - Full or partial name (case-insensitive)
  - Nickname
  - Email
  - Mobile number (Australian format)
  - ABN (11-digit number)
- Partial and case-insensitive matches should be supported.
- Suggestions appear after 3+ characters and show only payee names (up to 10).
- Mobile numbers may be entered in multiple formats (e.g. `0412784539`, `0412 784 539`, `0412-784-539`, `0412.784.539`). The system should normalise and match all common formats.
- Search results should consistently display mobile numbers in the `0412 784 539` format.

## Technical Requirements

- React with TypeScript
- Vite build tool
- Vitest for unit testing
- Playwright for end-to-end testing
- CucumberJS with Playwright and TypeScript for BDD acceptance criteria
- Use of mock API service to simulate saved payees
- Page Object Model for Playwright and Cucumber tests
- Accessibility with ARIA fields
- Commonwealth Bank color scheme (yellow and black)

## Testing and BDD

The executable specifications to implement are defined in tests/cucumber/features/search-payees.feature. We will use these to drive development. After creating the starter project, make sure you first configure Cucumber/JS and implement empty step definitions for this feature file.

- Gherkin scenarios must reflect user-facing rules and behaviours, not UI steps.
- Scenario Outlines should be used for testing multiple types of identifiers (email, mobile, ABN, nickname).
- Cucumber scenarios and Playwright tests should be implementation-neutral and readable by business stakeholders.
- Include positive and negative examples.
- Unit tests for React components using Vitest.
- All tests must use seeded, consistent test data.

## API Specification

The frontend will call the API defined in [`API_SPECIFICATION.md`](API_SPECIFICATION.md) to retrieve matching payees. The API returns all matching payees based on the search query. The frontend is responsible for truncating and formatting results for suggestions and display.

## Implementation Approach

- Build incrementally using TDD:
  - Write a descriptive test for expected behaviour
  - Implement minimal code to pass the test
  - Refactor and repeat
- Start with the Saved Payees screen
- Create mock API endpoint for fetching payee data and mock the relevant API calls for each playwright test.
- Page objects must be used in all Playwright tests
- Focus only on the PayID address book in this phase

## Demo Mode

The application supports a demo mode for development and demonstration purposes:

- **Start demo mode**: `npm run dev:demo`
- **Regular mode**: `npm run dev`
- **Demo data**: 12 realistic PayID payees including emails, mobile numbers, and ABNs
- **Visual indicator**: Demo mode shows a banner indicating sample data is being used
- **Demo delay**: Longer loading simulation (800ms) for more realistic demonstration

Demo mode uses pre-seeded payee data defined in `src/data/demoPayees.ts` and enables the `VITE_DEMO_MODE` environment variable.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.  
NEVER create files unless they're absolutely necessary for achieving your goal.  
ALWAYS write descriptive tests before writing code, and run tests after each code change.  
ALWAYS prefer editing an existing file to creating a new one.  
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
