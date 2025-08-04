import { test, expect } from '@playwright/test';
import { PayIDAddressBookPage } from './pages/PayIDAddressBookPage';

test.describe('When viewing the list of payees', () => {
  let addressBookPage: PayIDAddressBookPage;

  test.beforeEach(async ({ page: playwright }) => {
    addressBookPage = new PayIDAddressBookPage(playwright);
    await addressBookPage.goto();
  });

  test('should display known payees in alphabetical order', async ({ page }) => {
    // Setup route **before** navigating
    await page.route('**/api/payees', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          payees: [
            { id: '1', name: 'Alexandra Smith', payid: 'a.smith@example.com', payidType: 'EMAIL', nickname: 'Lexi' },
            { id: '2', name: 'Benjamin Lee', payid: 'b.lee@example.com', payidType: 'EMAIL' },
            { id: '3', name: 'Charlotte Brown', payid: 'c.brown@example.com', payidType: 'EMAIL', nickname: 'Charlie' }
          ]
        })
      });
    });

    const addressBookPage = new PayIDAddressBookPage(page);
    await addressBookPage.goto();
    await addressBookPage.clickPayeeAddressBookTab();

    await expect(addressBookPage.payeeList).toBeVisible();

    const payeeNames = await addressBookPage.getVisiblePayeeNames();

    expect(payeeNames).toEqual(['Alexandra Smith (Lexi)', 'Benjamin Lee', 'Charlotte Brown (Charlie)']);
  });

  test('should display formatted name and PayID for email, mobile, and ABN', async ({ page }) => {
    await page.route('**/api/payees', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          payees: [
            { id: '1', name: 'Alexandra Smith', payid: 'a.smith@example.com', payidType: 'EMAIL', nickname: 'Lexi' },
            { id: '2', name: 'Charlotte Brown', payid: '61-0412345678', payidType: 'TELEPHONE', nickname: 'Charlie' },
            { id: '3', name: 'Cool Company Pty Ltd', payid: '43123456789', payidType: 'ABN' },
          ]
        })
      });
    });

    const addressBookPage = new PayIDAddressBookPage(page);
    await addressBookPage.goto();
    await addressBookPage.clickPayeeAddressBookTab();
    await expect(addressBookPage.payeeListItems).toHaveCount(3);

    const displayed = await addressBookPage.getDisplayedPayees();

    expect(displayed).toEqual([
      { name: 'Alexandra Smith (Lexi)', payid: 'a.smith@example.com' },
      { name: 'Charlotte Brown (Charlie)', payid: '61-0412345678' },
      { name: 'Cool Company Pty Ltd', payid: '43123456789' }
    ]);
  });

});