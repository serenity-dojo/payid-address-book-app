import { Page, Locator } from '@playwright/test';

export class PayIDAddressBookPage {
  readonly page: Page;
  readonly header: Locator;
  readonly title: Locator;
  readonly tabList: Locator;
  readonly payeeAddressBookTab: Locator;
  readonly addNewPayeeTab: Locator;
  readonly activeTab: Locator;
  readonly payeeAddressBookPanel: Locator;
  readonly addNewPayeePanel: Locator;
  readonly payeeListLoading: Locator;
  readonly payeeListEmpty: Locator;
  readonly payeeList: Locator;
  readonly addPayeePlaceholder: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('.app-header');
    this.title = page.locator('h1');
    this.tabList = page.locator('[role="tablist"]');
    this.payeeAddressBookTab = page.locator('button[role="tab"]', { hasText: 'Payee Address Book' });
    this.addNewPayeeTab = page.locator('button[role="tab"]', { hasText: 'Add New Payee' });
    this.activeTab = page.locator('button[role="tab"].active');
    this.payeeAddressBookPanel = page.locator('#address-book-panel');
    this.addNewPayeePanel = page.locator('#add-payee-panel');
    this.payeeListLoading = page.locator('.payee-list-loading');
    this.payeeListEmpty = page.locator('.payee-list-empty');
    this.payeeList = page.locator('.payee-list');
    this.addPayeePlaceholder = page.locator('text=PayID payee form will be implemented here');
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

  async waitForPayeeListContent(timeout = 10000) {
    await this.page.waitForSelector('.payee-list-loading, .payee-list-empty, .payee-list', { timeout });
  }
}