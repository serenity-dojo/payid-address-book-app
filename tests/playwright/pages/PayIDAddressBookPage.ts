import { Page, Locator } from '@playwright/test';
import type { PayeeDisplay } from '../types/payeeDisplay';

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
  readonly payeeListItems: Locator;
  readonly addPayeeForm: Locator;
  readonly addPayeeNameInput: Locator;
  readonly addPayeeValidateButton: Locator;

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
    this.payeeListItems = page.locator('.payee-list .payee-item');
    this.addPayeeForm = page.locator('form[role="form"]');
    this.addPayeeNameInput = page.locator('input#payee-name');
    this.addPayeeValidateButton = page.locator('button', { hasText: 'Validate PayID' });
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

  get payeeNames() {
    return this.payeeList.locator('.payee-item .payee-name');
  }

  async getVisiblePayeeNames(): Promise<string[]> {
    return await this.payeeNames.allTextContents();
  }

  async getDisplayedPayees(): Promise<PayeeDisplay[]> {
    const items = this.page.locator('.payee-item');
    const count = await items.count();

    const payees: PayeeDisplay[] = [];
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = await item.locator('.payee-name').innerText();
      const payid = await item.locator('.payee-payid').innerText();
      payees.push({ name, payid });
    }

    return payees;
  }
}