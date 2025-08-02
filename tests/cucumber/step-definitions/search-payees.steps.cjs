const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { PayeeSearchPage } = require('../page-objects/PayeeSearchPage.cjs');

// Background step - setting up payees in address book
Given('Priya has the following payees in her address book:', async function (dataTable) {
  const payeesData = dataTable.hashes();
  
  // Convert the data table to the API response format
  const payees = payeesData.map((row) => ({
    payeeName: row['Payee Name'],
    payID: row['PayID'].trim(),
    payIDType: row['PayID Type'],
    nickname: row['Nickname'] || null
  }));

  // Store the test data for later reference
  this.testPayees = payees;

  // Initialize page object and navigate to the application
  this.payeeSearchPage = new PayeeSearchPage(this.page);
  await this.payeeSearchPage.navigateToApp();
  
  // Set mock data using the payeeService (works in test mode due to HeadlessChrome detection)
  await this.page.evaluate((payeesData) => {
    // Convert API format back to internal format for mock service
    const internalPayees = payeesData.map((payee, index) => ({
      id: (index + 1).toString(),
      name: payee.payeeName,
      payid: payee.payID,
      payidType: payee.payIDType,
      nickname: payee.nickname || undefined
    }));
    window.payeeService?.setMockData(internalPayees);
  }, payees);
});

// Background step - setting up multiple payees with name pattern
Given('Priya has {int} payees in her address book with names starting with {string}', async function (count, namePattern) {
  // Generate realistic test payees with the specified name pattern
  const nameVariations = [
    'rina', 'rina Singh', 'rah Johnson', 'ina Williams', 'rina Brown', 'rah Davis', 'ina Miller', 'rina Wilson',
    'rah Moore', 'ina Taylor', 'rina Anderson', 'rah Thomas', 'ina Jackson', 'rina White', 'rah Harris',
    'ina Martin', 'rina Thompson', 'rah Garcia', 'ina Martinez', 'rina Robinson', 'rah Clark', 'ina Rodriguez'
  ];
  
  const payees = [];
  for (let i = 1; i <= count; i++) {
    const variation = nameVariations[i % nameVariations.length];
    payees.push({
      payeeName: `${namePattern}${variation}`,
      payID: `${namePattern.toLowerCase()}${i}@example.com`,
      payIDType: 'email',
      nickname: null
    });
  }

  // Store the test data for later reference
  this.testPayees = payees;

  // Initialize page object and navigate to the application
  this.payeeSearchPage = new PayeeSearchPage(this.page);
  await this.payeeSearchPage.navigateToApp();
  
  // Set mock data using the payeeService (works in test mode due to HeadlessChrome detection)
  await this.page.evaluate((payeesData) => {
    // Convert API format back to internal format for mock service
    const internalPayees = payeesData.map((payee, index) => ({
      id: (index + 1).toString(),
      name: payee.payeeName,
      payid: payee.payID,
      payidType: payee.payIDType,
      nickname: payee.nickname || undefined
    }));
    window.payeeService?.setMockData(internalPayees);
  }, payees);
});

// Action steps - searching for payees
When('Priya searches for {string}', async function (searchTerm) {
  await this.payeeSearchPage.performSearch(searchTerm);
});

// Action steps - entering text (for suggestions)
When('Priya enters {string}', async function (inputText) {
  await this.payeeSearchPage.enterTextForSuggestions(inputText);
});

// Assertion steps - checking search results
Then('she should see the following results:', async function (dataTable) {
  const expectedResults = dataTable.hashes();
  
  // Get actual search results using page object
  const actualResults = await this.payeeSearchPage.getSearchResultData();
  
  // Check that we have the expected number of results
  expect(actualResults.length).toBe(expectedResults.length);
  
  // Verify each result matches the expected format
  for (let i = 0; i < expectedResults.length; i++) {
    const expectedResult = expectedResults[i];
    const actualResult = actualResults[i];
    
    // Verify the display name contains the expected payee name
    expect(actualResult.displayName).toContain(expectedResult['Payee Name']);
    
    // Verify the PayID matches expected format
    const expectedPayId = expectedResult['PayID'].trim();
    expect(actualResult.payId).toBe(expectedPayId);
  }
});

// Assertion steps - checking no results message
Then('she should see a message indicating no results were found', async function () {
  // Check that the no results message is displayed using page object
  const isNoResultsVisible = await this.payeeSearchPage.isNoResultsMessageVisible();
  expect(isNoResultsVisible).toBe(true);
  
  const message = await this.payeeSearchPage.getNoResultsMessage();
  expect(message).toContain('No payees found');
});

// Assertion steps - checking suggestions
Then('the system should suggest the following payee names:', async function (dataTable) {
  const expectedSuggestions = dataTable.hashes();
  
  // Get actual suggestions using page object
  const suggestionTexts = await this.payeeSearchPage.getSuggestionTexts();
  
  // Check that we have the expected number of suggestions
  expect(suggestionTexts.length).toBe(expectedSuggestions.length);
  
  // Verify each suggestion matches expected payee name
  for (let i = 0; i < expectedSuggestions.length; i++) {
    const expectedSuggestion = expectedSuggestions[i];
    expect(suggestionTexts[i]).toContain(expectedSuggestion['Payee Name']);
  }
});

// Assertion steps - checking no suggestions
Then('no suggestions should be shown', async function () {
  // Check that the suggestions dropdown is not visible using page object
  const isHidden = await this.payeeSearchPage.isSuggestionsDropdownHidden();
  expect(isHidden).toBe(true);
});

// Assertion steps - checking limited suggestions
Then('only the first {int} matching payee names should be suggested', async function (maxCount) {
  // Get suggestion count using page object
  const suggestionsCount = await this.payeeSearchPage.getSuggestionsCount();
  
  // Check that we have no more than the maximum count
  expect(suggestionsCount).toBeLessThanOrEqual(maxCount);
  expect(suggestionsCount).toBe(maxCount); // Should be exactly the max since we have more payees
});