const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Background step - setting up payees in address book for viewing
Given('Rachael has the following payees in her address book:', async function (dataTable) {
  const payeesData = dataTable.hashes();
  
  // Convert the data table to the format expected by the API
  const payees = payeesData.map((row, index) => ({
    id: (index + 1).toString(),
    name: row['Payee Name'],
    payid: row['PayID'],
    payidType: row['PayID Type'],
    nickname: row['Nickname'] || undefined
  }));

  // Mock the API endpoint that returns payees
  await this.page.route('**/api/payees', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ payees })
    });
  });
});

// Background step - empty address book
Given('Rachael has no payees in her address book', async function () {
  // Mock the API endpoint to return empty payees array
  await this.page.route('**/api/payees', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ payees: [] })
    });
  });
});

// Action step - viewing the address book
When('Rachael views her address book', async function () {
  // Navigate to the application (use full URL for Cucumber tests)
  await this.page.goto('http://localhost:5173/');
  
  // Wait for the payee list to load (either loading, empty, or actual list)
  await this.page.waitForSelector('.payee-list-loading, .payee-list-empty, .payee-list', { timeout: 10000 });
});

// Assertion step - checking displayed payees with formatting
Then('her payees should be presented as follows:', async function (dataTable) {
  const expectedPayees = dataTable.hashes();
  
  // Wait for the payee list to be visible
  await this.page.waitForSelector('.payee-list', { timeout: 5000 });
  
  // Get all payee items from the DOM
  const payeeItems = await this.page.locator('.payee-item').all();
  
  // Check that we have the expected number of payees
  expect(payeeItems.length).toBe(expectedPayees.length);
  
  // Verify each payee item matches the expected format
  for (let i = 0; i < expectedPayees.length; i++) {
    const expectedPayee = expectedPayees[i];
    const payeeItem = payeeItems[i];
    
    // Get the display name and PayID from the payee item
    const displayName = await payeeItem.locator('.payee-name').textContent();
    const payId = await payeeItem.locator('.payee-payid').textContent();
    
    // Verify the display name matches expected format
    expect(displayName.trim()).toBe(expectedPayee['Display Name']);
    
    // Verify the PayID matches expected format
    expect(payId.trim()).toBe(expectedPayee['PayID']);
  }
});

// Assertion step - checking empty state message
Then('she should see a message indicating no payees are saved', async function () {
  // Wait for the empty state to be visible
  await this.page.waitForSelector('.payee-list-empty', { timeout: 5000 });
  
  // Check that the empty state message is displayed
  const emptyMessage = await this.page.locator('.payee-list-empty p').textContent();
  expect(emptyMessage).toContain('No payees found');
});