Feature: View Payees in PayID Address Book
  As a retail banking customer
  I want to view my saved PayID payees in my address book
  So that I can see all my contacts and their details clearly

  Rule: Payees should be displayed with their name, nickname (if present), and formatted PayID

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name             | PayID               | PayID Type | Nickname |
        | Alexandra Smith        | a.smith@example.com | email      | Lexi     |
        | Andy Bolton            |          0412784539 | mobile     | AndyB    |
        | Sarah Thompson         | s.thompson@work.com | email      |          |
        | Willow Finance Pty Ltd |         80123456789 | abn        | Willow   |
        | Marcus Williams        |          0433859120 | mobile     |          |

    Example: Payees are displayed with correct formatting
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name                    | PayID               |
        | Alexandra Smith (Lexi)          | a.smith@example.com |
        | Andy Bolton (AndyB)             |        0412 784 539 |
        | Marcus Williams                 |        0433 859 120 |
        | Sarah Thompson                  | s.thompson@work.com |
        | Willow Finance Pty Ltd (Willow) |         80123456789 |

  Rule: Payees without nicknames should display name only

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name      | PayID            | PayID Type | Nickname |
        | John Mitchell   | john@example.com | email      |          |
        | Tech Corp Ltd   |      12345678901 | abn        |          |
        | Rebecca Johnson |       0456321098 | mobile     |          |

    Example: Payees without nicknames show name only
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name    | PayID            |
        | John Mitchell   | john@example.com |
        | Rebecca Johnson |     0456 321 098 |
        | Tech Corp Ltd   |      12345678901 |

  Rule: Mobile PayID values should be formatted with spaces in the display

    Background:
      Given Rachael has the following payees in her address book:
        | Payee Name    | PayID      | PayID Type | Nickname |
        | Mobile User 1 | 0412345678 | mobile     | Mob1     |
        | Mobile User 2 | 0433987654 | mobile     |          |
        | Mobile User 3 | 0456111222 | mobile     | Mobile3  |

    Example: Mobile numbers are displayed with proper Australian formatting
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name            | PayID        |
        | Mobile User 1 (Mob1)    | 0412 345 678 |
        | Mobile User 2           | 0433 987 654 |
        | Mobile User 3 (Mobile3) | 0456 111 222 |

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
        | Zoe Adams   | zoe@example.com   | email      | Z        |
        | Alice Brown | alice@example.com | email      |          |
        | Bob Charlie |        0412345678 | mobile     | Bobby    |

    Example: Payees are sorted alphabetically by name
      When Rachael views her address book
      Then her payees should be presented as follows:
        | Display Name        | PayID             |
        | Alice Brown         | alice@example.com |
        | Bob Charlie (Bobby) |      0412 345 678 |
        | Zoe Adams (Z)       | zoe@example.com   |
