# PayID Address Book - BDD/TDD Demo Project

A demonstration application showcasing **Behavior-Driven Development (BDD)** and **Test-Driven Development (TDD)** practices using React, TypeScript, Vite, and CucumberJS.

## 🎯 Project Overview

This project implements a searchable PayID address book for an online banking system, demonstrating how to:
- Set up CucumberJS with React and TypeScript
- Write executable specifications using Gherkin scenarios
- Implement BDD workflows with proper test automation
- Generate comprehensive test reports

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **BDD Framework**: CucumberJS 12.1.0
- **Testing**: Vitest (unit tests) + Playwright (E2E) + CucumberJS (BDD)
- **Reporting**: Cucumber HTML Reporter
- **Development**: ESLint + TypeScript strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- npm 10+

### Installation & Setup
```bash
# Clone and install dependencies
npm install

# Run development server
npm run dev

# Run Cucumber BDD tests
npm run test:cucumber

# Generate test reports
npm run test:cucumber:report
```

## 🥒 CucumberJS Setup Guide

This section documents the complete setup process for integrating CucumberJS with a React + TypeScript + Vite project.

### 1. Install Dependencies

```bash
npm install --save-dev @cucumber/cucumber @cucumber/html-formatter @types/node ts-node
```

### 2. Project Structure

```
tests/
├── cucumber/
│   ├── features/
│   │   ├── search-payees.feature
│   │   └── duplicate-payees.feature
│   ├── step-definitions/
│   │   ├── search-payees.steps.cjs
│   │   └── duplicate-payees.steps.cjs
│   ├── package.json              # Override ES modules
│   └── tsconfig.json            # TypeScript config for tests
├── cucumber.config.cjs          # Main Cucumber configuration
└── reports/                     # Generated HTML reports
```

### 3. Configuration Files

#### `cucumber.config.cjs`
```javascript
module.exports = {
  default: {
    paths: ['tests/cucumber/features/**/*.feature'],
    require: ['tests/cucumber/step-definitions/**/*.cjs'],
    format: [
      'progress',
      'html:reports/cucumber-report.html'
    ],
    publish: false,
    failFast: false,
    parallel: 1
  }
};
```

#### `tests/cucumber/package.json`
```json
{
  "type": "commonjs"
}
```

#### `tests/cucumber/tsconfig.json`
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  },
  "include": ["**/*"]
}
```

### 4. Step Definitions Example

```javascript
// tests/cucumber/step-definitions/search-payees.steps.cjs
const { Given, When, Then } = require('@cucumber/cucumber');

Given('Priya has the following payees in her address book:', function (dataTable) {
  // TODO: Implement step to set up payees data
});

When('Priya searches for {string}', function (searchTerm) {
  // TODO: Implement step to perform search action
});

Then('she should see the following results:', function (dataTable) {
  // TODO: Implement step to verify search results
});
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "test:cucumber": "npx cucumber-js --config cucumber.config.cjs",
    "test:cucumber:dry": "npx cucumber-js --config cucumber.config.cjs --dry-run", 
    "test:cucumber:watch": "npx cucumber-js --config cucumber.config.cjs --watch",
    "test:cucumber:report": "npx cucumber-js --config cucumber.config.cjs && echo '📊 Report generated at reports/cucumber-report.html'"
  }
}
```

## ⚠️ Common Gotchas & Solutions

### 1. ES Modules vs CommonJS Conflict

**Problem**: Projects with `"type": "module"` in package.json conflict with CucumberJS CommonJS requirements.

**Solution**: 
- Use `.cjs` extension for step definitions
- Create `tests/cucumber/package.json` with `{"type": "commonjs"}`
- Use `module.exports` syntax in configuration files

### 2. Step Definitions Not Loading

**Problem**: Cucumber reports "0 scenarios" or undefined steps.

**Solutions**:
- Ensure step definition files use `.cjs` extension
- Verify the `require` path in `cucumber.config.cjs` matches your file structure
- Check that step definition files are properly exporting functions
- Use `npm run test:cucumber:dry` to debug without execution

### 3. TypeScript Integration Issues

**Problem**: TypeScript compilation errors with step definitions.

**Solution**:
- Use JavaScript `.cjs` files for step definitions instead of TypeScript
- Create separate `tsconfig.json` in test directory with CommonJS module setting
- Install `@types/node` for Node.js type definitions

### 4. File Path Resolution

**Problem**: Cucumber can't find feature files or step definitions.

**Solution**:
- Use relative paths from project root in `cucumber.config.cjs`
- Ensure glob patterns match your actual file structure
- Test with `--dry-run` flag to verify file discovery

### 5. Report Generation

**Problem**: HTML reports not generating or empty.

**Solution**:
- Install `@cucumber/html-formatter` dependency
- Create `reports/` directory before running tests
- Use proper format syntax: `'html:reports/cucumber-report.html'`

## 📋 BDD Best Practices Demonstrated

### Feature File Structure
- **Given**: Set up the initial state
- **When**: Perform the action being tested  
- **Then**: Assert the expected outcome
- **Background**: Common setup for all scenarios
- **Scenario Outline**: Data-driven testing with examples

### Step Definition Patterns
- Use parameterized steps with `{string}`, `{int}`, `{word}`
- Create reusable steps that work across multiple scenarios
- Keep step definitions implementation-agnostic
- Use data tables for complex test data setup

### Gherkin Writing Guidelines
- Write scenarios from user perspective, not UI implementation
- Focus on business value and behavior, not technical details
- Use consistent language and terminology
- Include both positive and negative test cases

## 🎯 Business Rules Covered

The application demonstrates BDD implementation for:

- **Search Functionality**: Name, nickname, email, mobile, ABN matching
- **Data Normalization**: Mobile number format handling
- **Partial Matching**: Case-insensitive substring searches  
- **Suggestions**: Dropdown with 3+ character threshold
- **Result Limiting**: Maximum 10 suggestions displayed
- **Error Handling**: No results messaging
- **Duplicate Prevention**: PayID uniqueness validation

## 📊 Test Execution & Reporting

```bash
# Run all tests with console output
npm run test:cucumber

# Generate detailed HTML report
npm run test:cucumber:report

# View report
open reports/cucumber-report.html
```

## 🔄 Development Workflow

1. **Write Feature**: Define behavior in Gherkin scenarios
2. **Generate Steps**: Run with `--dry-run` to get missing step definitions
3. **Implement Steps**: Add step definition functions with TODO comments
4. **Build Feature**: Implement actual application code using TDD
5. **Verify**: Run tests and generate reports
6. **Refactor**: Improve code while maintaining green tests

## 📚 Next Steps

- Implement Playwright integration for UI automation
- Add Page Object Model for step definitions
- Set up CI/CD pipeline with test reporting
- Add visual regression testing
- Implement API mocking strategies

---

This project serves as a complete reference for implementing BDD with CucumberJS in React applications. The setup handles the common pitfalls and provides a solid foundation for behavior-driven development.
