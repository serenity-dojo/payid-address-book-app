import { test, expect } from '@playwright/test';
import { PayIDAddressBookPage } from './pages/PayIDAddressBookPage';

test.describe('PayID Address Book UI', () => {
  let page: PayIDAddressBookPage;

  test.beforeEach(async ({ page: playwright }) => {
    page = new PayIDAddressBookPage(playwright);
    await page.goto();
  });

  test('should display the main app with correct branding', async () => {
    await expect(page.title).toContainText('PayID Address Book');
    await expect(page.header).toBeVisible();
    await expect(page.header).toHaveClass('app-header');
  });

  test('should have two tabs: Payee Address Book and Add New Payee', async () => {
    await expect(page.payeeAddressBookTab).toBeVisible();
    await expect(page.addNewPayeeTab).toBeVisible();
  });

  test('should have Payee Address Book tab active by default', async () => {
    await expect(page.activeTab).toContainText('Payee Address Book');
    await expect(page.payeeAddressBookTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.payeeAddressBookPanel).toBeVisible();
  });

  test('should switch tabs when clicked', async () => {
    await page.clickAddNewPayeeTab();

    await expect(page.activeTab).toContainText('Add New Payee');
    await expect(page.addNewPayeeTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.addNewPayeePanel).toBeVisible();
    await expect(page.payeeAddressBookTab).not.toHaveClass(/active/);
    await expect(page.payeeAddressBookTab).toHaveAttribute('aria-selected', 'false');
  });

  test('should have proper ARIA accessibility attributes', async () => {
    await expect(page.tabList).toHaveAttribute('aria-label', 'PayID Address Book Navigation');
    await expect(page.payeeAddressBookTab).toHaveAttribute('aria-controls', 'address-book-panel');
    await expect(page.payeeAddressBookTab).toHaveAttribute('id', 'address-book-tab');
    await expect(page.payeeAddressBookPanel).toHaveAttribute('aria-labelledby', 'address-book-tab');
  });
});