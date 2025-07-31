import { Page, Locator, expect } from '@playwright/test';

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

  async expectHeaderHasCBABranding() {
    // Verify header exists and has the correct class for CBA styling
    await expect(this.header).toBeVisible();
    await expect(this.header).toHaveClass('app-header');
  }

  async expectTitleToContain(text: string) {
    await expect(this.title).toContainText(text);
  }

  async expectBothTabsVisible() {
    await expect(this.payeeAddressBookTab).toBeVisible();
    await expect(this.addNewPayeeTab).toBeVisible();
  }

  async expectPayeeAddressBookTabActive() {
    await expect(this.activeTab).toContainText('Payee Address Book');
    await expect(this.payeeAddressBookTab).toHaveAttribute('aria-selected', 'true');
    await expect(this.payeeAddressBookPanel).toBeVisible();
  }

  async expectAddNewPayeeTabActive() {
    await expect(this.activeTab).toContainText('Add New Payee');
    await expect(this.addNewPayeeTab).toHaveAttribute('aria-selected', 'true');
    await expect(this.addNewPayeePanel).toBeVisible();
  }

  async expectPayeeAddressBookTabInactive() {
    await expect(this.payeeAddressBookTab).not.toHaveClass(/active/);
    await expect(this.payeeAddressBookTab).toHaveAttribute('aria-selected', 'false');
  }

  async expectProperARIAAttributes() {
    await expect(this.tabList).toHaveAttribute('aria-label', 'PayID Address Book Navigation');
    await expect(this.payeeAddressBookTab).toHaveAttribute('aria-controls', 'address-book-panel');
    await expect(this.payeeAddressBookTab).toHaveAttribute('id', 'address-book-tab');
    await expect(this.payeeAddressBookPanel).toHaveAttribute('aria-labelledby', 'address-book-tab');
  }

  async expectPlaceholderContent() {
    await expect(this.page.locator('text=No payees found')).toBeVisible();
  }

  async expectAddPayeePlaceholderContent() {
    await expect(this.page.locator('text=PayID payee form will be implemented here')).toBeVisible();
  }
}