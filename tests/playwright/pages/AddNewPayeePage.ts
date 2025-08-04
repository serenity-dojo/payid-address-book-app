import { Page, Locator } from '@playwright/test';

export class AddNewPayeePage {
  readonly page: Page;
  readonly payeeAddressBookTab: Locator;
  readonly addNewPayeeTab: Locator;
  readonly emailPayID: Locator;
  readonly mobilePayID: Locator;
  readonly abnPayID: Locator;
  readonly payId: Locator;
  readonly validatePayID: Locator;
  readonly errorMessage: Locator;

  readonly confirmationCheckbox: Locator;
  readonly payIdOwnerName: Locator;
  readonly payIdType: Locator;
  readonly addPayButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.payeeAddressBookTab = page.locator('button[role="tab"]', { hasText: 'Payee Address Book' });
    this.addNewPayeeTab = page.locator('button[role="tab"]', { hasText: 'Add New Payee' });
    this.emailPayID = page.locator('button', { hasText: 'Email' });
    this.mobilePayID = page.locator('button', { hasText: 'Mobile' });
    this.abnPayID = page.locator('button', { hasText: 'ABN' });
    this.payId = page.getByTestId('payid');
    this.validatePayID = page.locator('button', { hasText: 'Validate PayID' });
    this.errorMessage = page.getByRole('alert');

    this.confirmationCheckbox = page.getByTestId('confirmation-checkbox');
    this.payIdOwnerName = page.getByTestId('payid-name');
    this.payIdType = page.getByTestId('payid-type');
    this.addPayButton = page.getByRole('button', { name: 'Add Payee' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickPayeeAddressBookTab() {
    await this.payeeAddressBookTab.click();
  }

  async clickAddNewPayeeTab() {
    await this.addNewPayeeTab.click();
  }

}