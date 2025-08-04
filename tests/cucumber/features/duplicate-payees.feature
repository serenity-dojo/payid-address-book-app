Feature: Prevent adding duplicate PayID payees
  As a retail banking customer
  I want to avoid saving the same PayID more than once in my address book
  So I don't end up with duplicate payees when making a payment

  Rule: A PayID that already exists in the address book cannot be added again

    Example: The one where Priya tries to add an email already in her address book
      Given Priya has saved the following payee:
        | Payee Name | PayID           | PayID Type | Nickname |
        | Ben Smith  | ben@example.com | Email      | Benny    |
      When she tries to add a new payee with email "ben@example.com"
      Then she should see a message saying "This PayID is already saved for Ben Smith."
