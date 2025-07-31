Feature: Prevent adding duplicate PayID payees
  As a retail banking customer
  I want to avoid saving the same PayID more than once in my address book
  So I don’t end up with duplicate payees when making a payment

  Rule: A PayID that already exists in the address book cannot be added again

    Example: The one where Priya tries to add an email already in her address book
      Given Priya has saved the following payee:
        | Payee Name | PayID           | PayID Type | Nickname |
        | Ben Smith  | ben@example.com | Email      | Benny    |
      When she tries to add a new payee with email "ben@example.com"
      Then she should see a message saying "This PayID is already saved for Ben Smith."

    Example: The one where Priya tries to add a mobile already in her address book
      Given Priya has saved the following payee:
        | Payee Name | PayID      | PayID Type | Nickname |
        | Bob Jones  | 0400000001 | Mobile     | Bobby    |
      When she tries to add a new payee with mobile "0400000001"
      Then she should see a message saying "This PayID is already saved for Bob Jones."

    Example: The one where Priya tries to add an ABN already in her address book
      Given Priya has saved the following payee:
        | Payee Name   | PayID    | PayID Type | Nickname |
        | Fun Yoga Inc | 12345678 | ABN        | Yoga     |
      When she tries to add a new payee with ABN "12345678"
      Then she should see a message saying "This PayID is already saved for Fun Yoga Inc."

  Rule: PayID checks are case-insensitive

    Example: The one where Priya tries to add BEN@Example.com but ben@example.com already exists
      Given Priya has saved the following payee:
        | Payee Name | PayID           | PayID Type | Nickname |
        | Ben Smith  | ben@example.com | Email      | Benny    |
      When she tries to add a new payee with email "BEN@Example.com"
      Then she should see a message saying "This PayID is already saved for Ben Smith."

  Rule: PayID checks should normalize white space

    Example: The one where Priya tries to add an email with extra spaces
      Given Priya has saved the following payee:
        | Payee Name | PayID           | PayID Type | Nickname |
        | Ben Smith  | ben@example.com | Email      | Benny    |
      When she tries to add a new payee with email "  ben@example.com  "
      Then she should see a message saying "This PayID is already saved for Ben Smith."

    Example: The one where Priya tries to add an ABN with leading and trailing spaces
      Given Priya has saved the following payee:
        | Payee Name   | PayID    | PayID Type | Nickname |
        | Fun Yoga Inc | 12345678 | ABN        | Yoga     |
      When she tries to add a new payee with ABN " 12345678 "
      Then she should see a message saying "This PayID is already saved for Fun Yoga Inc."

  Rule: PayID checks should normalize mobile number formats

    Scenario Outline: The one where Priya tries different mobile number formats but the same number exists
      Given Priya has saved the following payee:
        | Payee Name | PayID      | PayID Type | Nickname |
        | Ben Rogers | 0400000001 | Mobile     | Ben      |
      When she tries to add a new payee with mobile "<EnteredMobile>"
      Then she should see a message saying "This PayID is already saved for Ben Rogers."

      Examples:
        | EnteredMobile   |
        |    0400 000 001 |
        |    0400-000-001 |
        | (0400) 000 001  |
        | +61 400 000 001 |
        |    +61400000001 |

  Rule: PayIDs are considered duplicates even if the name or nickname is different

    Example: The one where Priya tries to add an email with a different nickname
      Given Priya has saved the following payee:
        | Payee Name | PayID           | PayID Type | Nickname |
        | Ben Smith  | ben@example.com | Email      | Benny    |
      When she tries to add a new payee with email "ben@example.com" and nickname "Ben R"
      Then she should see a message saying "This PayID is already saved for Ben Smith."

    Example: The one where Priya tries to add a mobile with a different name
      Given Priya has saved the following payee:
        | Payee Name | PayID      | PayID Type | Nickname |
        | Ben Rogers | 0400000001 | Mobile     | Ben      |
      When she tries to add a new payee with mobile "0400000001" and nickname "B. Rogers"
      Then she should see a message saying "This PayID is already saved for Ben Rogers."
