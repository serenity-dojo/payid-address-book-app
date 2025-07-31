const { Given, When, Then } = require('@cucumber/cucumber');

// Background step - setting up a single saved payee
Given('Priya has saved the following payee:', function (dataTable) {
  // TODO: Implement step to set up a single saved payee
});

// Action steps - trying to add payees with various PayID types
When('{word} tries to add a new payee with {word} {string}', function (actor, payidType, payidValue) {
  // TODO: Implement step to attempt adding payee with any PayID type
});

When('{word} tries to add a new payee with {word} {string} and nickname {string}', function (actor, payidType, payidValue, nickname) {
  // TODO: Implement step to attempt adding payee with any PayID type and nickname
});

// Assertion step - checking for duplicate error message
Then('{word} should see a message saying {string}', function (actor, expectedMessage) {
  // TODO: Implement step to verify duplicate payee error message
});