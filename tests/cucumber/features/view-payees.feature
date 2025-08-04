Feature: View Payees in PayID Address Book
  As a retail banking customer
  I want to view my saved PayID payees in my address book
  So that I can see all my contacts and their details clearly

  Rule: Payees should be displayed with their name, nickname (if present), and formatted PayID

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name             | PayID               | PayID Type | Nickname |
        | Alexandra Smith        | a.smith@example.com | EMAIL      | Lexi     |
        | Andy Bolton            |          0412784539 | TELEPHONE  | AndyB    |
        | Sarah Thompson         | s.thompson@work.com | EMAIL      |          |
        | Willow Finance Pty Ltd |         80123456789 | ABN        | Willow   |
        | Marcus Williams        |          0433859120 | TELEPHONE  |          |

    Example: Payees are displayed with correct formatting
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name                    | PayID               |
        | Alexandra Smith (Lexi)          | a.smith@example.com |
        | Andy Bolton (AndyB)             |          0412784539 |
        | Marcus Williams                 |          0433859120 |
        | Sarah Thompson                  | s.thompson@work.com |
        | Willow Finance Pty Ltd (Willow) |         80123456789 |

  Rule: Payees without nicknames should display name only

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name      | PayID            | PayID Type | Nickname |
        | John Mitchell   | john@example.com | EMAIL      |          |
        | Tech Corp Ltd   |      12345678901 | ABN        |          |
        | Rebecca Johnson |       0456321098 | TELEPHONE  |          |

    Example: Payees without nicknames show name only
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name    | PayID            |
        | John Mitchell   | john@example.com |
        | Rebecca Johnson |       0456321098 |
        | Tech Corp Ltd   |      12345678901 |

  Rule: Mobile PayID values should be formatted with spaces in the display

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name    | PayID      | PayID Type | Nickname |
        | Mobile User 1 | 0412345678 | TELEPHONE  | Mob1     |
        | Mobile User 2 | 0433987654 | TELEPHONE  |          |
        | Mobile User 3 | 0456111222 | TELEPHONE  | Mobile3  |

    Example: Mobile numbers are displayed with proper Australian formatting
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name            | PayID      |
        | Mobile User 1 (Mob1)    | 0412345678 |
        | Mobile User 2           | 0433987654 |
        | Mobile User 3 (Mobile3) | 0456111222 |

  Rule: Empty address book should show appropriate message

    Background:
      Given Rachael has no payees in her address book

    Example: Empty address book shows no payees message
      When Rachael views her address book
      Then she should see a message indicating no payees are saved

  Rule: Payees should be displayed in alphabetical order by name

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name  | PayID             | PayID Type | Nickname |
        | Zoe Adams   | zoe@example.com   | EMAIL      | Z        |
        | Alice Brown | alice@example.com | EMAIL      |          |
        | Bob Charlie |        0412345678 | TELEPHONE  | Bobby    |

    Example: Payees are sorted alphabetically by name
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name        | PayID             |
        | Alice Brown         | alice@example.com |
        | Bob Charlie (Bobby) |        0412345678 |
        | Zoe Adams (Z)       | zoe@example.com   |
