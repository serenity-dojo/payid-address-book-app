class PayeeListPage {
  constructor(page) {
    this.page = page;
    
    // Main container elements
    this.appContainer = page.locator('.app-container');
    this.payeeAddressBookPanel = page.locator('#address-book-panel');
    
    // Payee list elements
    this.payeeList = page.locator('.payee-list');
    this.payeeListEmpty = page.locator('.payee-list-empty');
    this.payeeListLoading = page.locator('.payee-list-loading');
    this.payeeItems = page.locator('.payee-item');
    
    // Individual payee item elements
    this.payeeNames = page.locator('.payee-name');
    this.payeePayIds = page.locator('.payee-payid');
    
    // Empty state message
    this.emptyStateMessage = page.locator('.payee-list-empty p');
  }

  async navigateToApp() {
    await this.page.goto('http://localhost:5173/');
    // Wait for the main app to load
    await this.page.waitForSelector('.app-container', { timeout: 10000 });
  }

  async waitForPayeeListToLoad() {
    // Wait for any of the possible states: loading, empty, or actual list
    await this.page.waitForSelector('.payee-list-loading, .payee-list-empty, .payee-list', { timeout: 10000 });
  }

  async waitForPayeeList() {
    await this.page.waitForSelector('.payee-list', { timeout: 5000 });
  }

  async waitForEmptyState() {
    await this.page.waitForSelector('.payee-list-empty', { timeout: 5000 });
  }

  async getPayeeItems() {
    await this.waitForPayeeList();
    return await this.payeeItems.all();
  }

  async getPayeeCount() {
    const items = await this.getPayeeItems();
    return items.length;
  }

  async getPayeeData() {
    const payeeItems = await this.getPayeeItems();
    const payees = [];
    
    for (const item of payeeItems) {
      const displayName = await item.locator('.payee-name').textContent();
      const payId = await item.locator('.payee-payid').textContent();
      payees.push({
        displayName: displayName.trim(),
        payId: payId.trim()
      });
    }
    
    return payees;
  }

  async isEmptyStateVisible() {
    try {
      await this.waitForEmptyState();
      return await this.payeeListEmpty.isVisible();
    } catch {
      return false;
    }
  }

  async getEmptyStateMessage() {
    await this.waitForEmptyState();
    return await this.emptyStateMessage.textContent();
  }

  async isPayeeListVisible() {
    try {
      await this.waitForPayeeList();
      return await this.payeeList.isVisible();
    } catch {
      return false;
    }
  }
}

module.exports = { PayeeListPage };