const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { PayeeListPage } = require('../page-objects/PayeeListPage.cjs');

// Background step - setting up payees in address book for viewing
Given('Rachael has the following payees in her address book:', async function (dataTable) {
  const payeesData = dataTable.hashes();
  
  // Convert the data table to the internal format for mock service
  const payees = payeesData.map((row, index) => ({
    id: (index + 1).toString(),
    name: row['Payee Name'],
    payid: row['PayID'],
    payidType: row['PayID Type'],
    nickname: row['Nickname'] || undefined
  }));

  // Store the test data for later reference
  this.testPayees = payees;

  // Initialize page object and navigate to the application
  this.payeeListPage = new PayeeListPage(this.page);
  await this.payeeListPage.navigateToApp();
  
  // Set mock data using the payeeService (works in test mode due to HeadlessChrome detection)
  await this.page.evaluate((payeesData) => {
    window.payeeService?.setMockData(payeesData);
  }, payees);
});

// Background step - empty address book
Given('Rachael has no payees in her address book', async function () {
  // Initialize page object and navigate to the application
  this.payeeListPage = new PayeeListPage(this.page);
  await this.payeeListPage.navigateToApp();
  
  // Clear all payees using the payeeService (works in test mode due to HeadlessChrome detection)
  await this.page.evaluate(() => {
    window.payeeService?.clearPayees();
  });
});

// Action step - viewing the address book
When('Rachael views her address book', async function () {
  // Wait for the payee list to load using page object
  await this.payeeListPage.waitForPayeeListToLoad();
});

// Assertion step - checking displayed payees with formatting
Then('her payees should be presented as follows:', async function (dataTable) {
  const expectedPayees = dataTable.hashes();
  
  // Get actual payee data using page object
  const actualPayees = await this.payeeListPage.getPayeeData();
  
  // Check that we have the expected number of payees
  expect(actualPayees.length).toBe(expectedPayees.length);
  
  // Verify each payee item matches the expected format
  for (let i = 0; i < expectedPayees.length; i++) {
    const expectedPayee = expectedPayees[i];
    const actualPayee = actualPayees[i];
    
    // Verify the display name matches expected format
    expect(actualPayee.displayName).toBe(expectedPayee['Display Name']);
    
    // Verify the PayID matches expected format
    expect(actualPayee.payId).toBe(expectedPayee['PayID']);
  }
});

// Assertion step - checking empty state message
Then('she should see a message indicating no payees are saved', async function () {
  // Check that the empty state is visible using page object
  const isEmptyStateVisible = await this.payeeListPage.isEmptyStateVisible();
  expect(isEmptyStateVisible).toBe(true);
  
  // Check that the empty state message is displayed
  const emptyMessage = await this.payeeListPage.getEmptyStateMessage();
  expect(emptyMessage).toContain('No payees found');
});