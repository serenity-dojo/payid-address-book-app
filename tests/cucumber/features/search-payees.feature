Feature: Search for a Payee in my PayID Address Book
  As a retail banking customer
  I want to search my PayID address book by name, nickname, email, mobile number, or ABN
  So that I can quickly find the right person when making a payment

  Rule: Should be able to search by name, nickname, email, or mobile number

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name      | PayID               | PayID Type | Nickname |
        | Alexandra Smith | a.smith@example.com | EMAIL      | Lexi     |
        | Andy Bolton     |        0412 784 539 | TELEPHONE  | AndyB    |

    Example: Search by nickname
      When Priya searches for "Lexi"
      Then she should see the following results:
        | Payee Name      | PayID               |
        | Alexandra Smith | a.smith@example.com |

    Example: Search by email
      When Priya searches for "a.smith@example.com"
      Then she should see the following results:
        | Payee Name      | PayID               |
        | Alexandra Smith | a.smith@example.com |

    Example: Search by mobile number
      When Priya searches for "0412 784 539"
      Then she should see the following results:
        | Payee Name  | PayID        |
        | Andy Bolton | 0412 784 539 |

  Rule: Should return exact matches when searching by any supported identifier

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name             | PayID               | PayID Type | Nickname |
        | Alexandra Smith        | a.smith@example.com | EMAIL      | Lexi     |
        | Andy Bolton            |        0412 784 539 | TELEPHONE  | AndyB    |
        | Willow Finance Pty Ltd |         80123456789 | ABN        | Willow   |

    Scenario Outline: Search returns correct payee by identifier
      When Priya searches for "<searchTerm>"
      Then she should see the following results:
        | Payee Name  | PayID   |
        | <payeeName> | <payID> |

      Examples:
        | searchTerm          | payeeName              | payID               | PayID Type |
        | Lexi                | Alexandra Smith        | a.smith@example.com | EMAIL      |
        | a.smith@example.com | Alexandra Smith        | a.smith@example.com | EMAIL      |
        |        0412 784 539 | Andy Bolton            |        0412 784 539 | TELEPHONE  |
        |         80123456789 | Willow Finance Pty Ltd |         80123456789 | ABN        |

    Scenario Outline: Mobile number is normalised and matched regardless of formatting
      Given Priya has the following payees in her address book:
        | Payee Name  | PayID        | PayID Type | Nickname |
        | Andy Bolton | 0412 784 539 | mobile     | AndyB    |
      When Priya searches for "<searchTerm>"
      Then she should see the following results:
        | Payee Name  | PayID        |
        | Andy Bolton | 0412 784 539 |

      Examples:
        | searchTerm   |
        |   0412784539 |
        | 0412 784 539 |
        | 0412-784-539 |
        | 0412.784.539 |

  Rule: Search results are matched case-insensitively

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name      | PayID               | PayID Type | Nickname |
        | Alex Wilson     | alex.w@example.com  | EMAIL      |          |
        | Alexandra Smith | a.smith@example.com | EMAIL      | Lexi     |
        | Andy Bolton     |        0412 784 539 | TELEPHONE  | AndyB    |

    Example: Lowercase search matches mixed case names
      When Priya searches for "alex"
      Then she should see the following results:
        | Payee Name      | PayID               |
        | Alex Wilson     | alex.w@example.com  |
        | Alexandra Smith | a.smith@example.com |

  Rule: Partial matches should be allowed

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name             | PayID                 | PayID Type | Nickname |
        | Samantha Blake         |          0456 321 098 | TELEPHONE  | SamB     |
        | Sam O'Reilly           | sam.o@example.com     | EMAIL      | Sammy    |
        | William Thomson        | w.thomson@example.com | EMAIL      | Bill     |
        | Willow Finance Pty Ltd |           80123456789 | ABN        | Willow   |
        | Alex Wilson            | alex.w@example.com    | EMAIL      |          |

    Example: Partial match on first name
      When Priya searches for "Sam"
      Then she should see the following results:
        | Payee Name     | PayID             |
        | Sam O'Reilly   | sam.o@example.com |
        | Samantha Blake |      0456 321 098 |

    Example: Partial match across business and personal names
      When Priya searches for "Wil"
      Then she should see the following results:
        | Payee Name             | PayID                 |
        | Alex Wilson            | alex.w@example.com    |
        | William Thomson        | w.thomson@example.com |
        | Willow Finance Pty Ltd |           80123456789 |

  Rule: If no payees match the search, a “no results” message is displayed

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name  | PayID              | PayID Type | Nickname |
        | Alex Wilson | alex.w@example.com | EMAIL      |          |

    Example: Search with no matches
      When Priya searches for "XYZ"
      Then she should see a message indicating no results were found

  Rule: Should display suggestions when 3 or more letters are entered

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name     | PayID               | PayID Type | Nickname |
        | Samantha Blake | s.blake@example.com | EMAIL      | SamB     |
        | Sam O'Reilly   |          0433859120 | TELEPHONE  | Sammy    |

    Example: Three or more letters triggers suggestions
      When Priya enters "Sam"
      Then the system should suggest the following payee names:
        | Payee Name     |
        | Sam O'Reilly   |
        | Samantha Blake |

    Example: Fewer than 3 letters shows no suggestions
      When Priya enters "Sa"
      Then no suggestions should be shown

  Rule: Only the first 10 matching suggestions should be displayed

    Background:
      Given Priya has 20 payees in her address book with names starting with "Sab"

    Example: Suggest only the first 10 matching results
      When Priya enters "Sab"
      Then only the first 10 matching payee names should be suggested

  Rule: Business contacts can be searched by ABN

    Background:
      Given Priya has the following payees in her address book:
        | Payee Name             | PayID       | PayID Type | Nickname |
        | Willow Finance Pty Ltd | 80123456789 | ABN        | Willow   |

    Example: Search by ABN returns business contact
      When Priya searches for "80123456789"
      Then she should see the following results:
        | Payee Name             | PayID       |
        | Willow Finance Pty Ltd | 80123456789 |
