const { Given, When, Then } = require('@cucumber/cucumber');

// Background step - setting up payees in address book for viewing
Given('Rachael has the following payees in her address book:', function (dataTable) {
  // TODO: Implement step to set up payees data for viewing tests
});

// Background step - empty address book
Given('Rachael has no payees in her address book', function () {
  // TODO: Implement step to set up empty address book
});

// Action step - viewing the address book
When('Rachael views her address book', function () {
  // TODO: Implement step to navigate to and view the address book
});

// Assertion step - checking displayed payees with formatting
Then('her payees should be presented as follows:', function (dataTable) {
  // TODO: Implement step to verify displayed payees match expected format
  // Should check:
  // - Display name format (Name or Name (Nickname))
  // - PayID formatting (mobile numbers with spaces)
  // - Alphabetical ordering
});

// Assertion step - checking empty state message
Then('she should see a message indicating no payees are saved', function () {
  // TODO: Implement step to verify empty state message is displayed
});