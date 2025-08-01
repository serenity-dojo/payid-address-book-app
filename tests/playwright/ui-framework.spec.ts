import { test } from '@playwright/test';
import { PayIDAddressBookPage } from './pages/PayIDAddressBookPage';

test.describe('PayID Address Book UI Framework', () => {
  let page: PayIDAddressBookPage;

  test.beforeEach(async ({ page: playwright }) => {
    page = new PayIDAddressBookPage(playwright);
    await page.goto();
  });

  test('should display the main app with correct CBA branding', async () => {
    await page.expectTitleToContain('PayID Address Book');
    await page.expectHeaderHasCBABranding();
  });

  test('should have two tabs: Payee Address Book and Add New Payee', async () => {
    await page.expectBothTabsVisible();
  });

  test('should have Payee Address Book tab active by default', async () => {
    await page.expectPayeeAddressBookTabActive();
  });

  test('should switch tabs when clicked', async () => {
    await page.clickAddNewPayeeTab();
    await page.expectAddNewPayeeTabActive();
    await page.expectPayeeAddressBookTabInactive();
  });

  test('should have proper ARIA accessibility attributes', async () => {
    await page.expectProperARIAAttributes();
  });

  test('should display payee list content in address book tab', async () => {
    await page.expectPayeeListContent();
    
    await page.clickAddNewPayeeTab();
    await page.expectAddPayeePlaceholderContent();
  });
});