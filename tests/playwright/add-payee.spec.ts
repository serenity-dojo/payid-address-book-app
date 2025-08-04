import { test, expect } from '@playwright/test';
import { AddNewPayeePage } from './pages/AddNewPayeePage';

test.describe('When adding a new payee', () => {
  let addNewPayeePage: AddNewPayeePage;

  test.beforeEach(async ({ page: playwright }) => {
    addNewPayeePage = new AddNewPayeePage(playwright);
    await addNewPayeePage.goto();
    await addNewPayeePage.clickAddNewPayeeTab();
  });

  test('should be able to add a new PayID via email, mobile or ABN', async () => {
    await expect(addNewPayeePage.emailPayID).toBeVisible();
    await expect(addNewPayeePage.mobilePayID).toBeVisible();
    await expect(addNewPayeePage.abnPayID).toBeVisible();
  });

  test.describe('When the user selects a PayID type', async () => {

    test('should prompt for the right format for email PayIDs', async () => {
      await addNewPayeePage.emailPayID.click();
      const placeholderText = await addNewPayeePage.payId.getAttribute('placeholder');
      expect(placeholderText).toBe('user@example.com');
    });

    test('should prompt for the right format for mobile PayIDs', async () => {
      await addNewPayeePage.mobilePayID.click();
      const placeholderText = await addNewPayeePage.payId.getAttribute('placeholder');
      expect(placeholderText).toBe('0412 345 678');
    });

    test('should prompt for the right format for ABN PayIDs', async () => {
      await addNewPayeePage.abnPayID.click();
      const placeholderText = await addNewPayeePage.payId.getAttribute('placeholder');
      expect(placeholderText).toBe('12345678901');
    });

    test.describe('When the user enters a PayID value', async () => {

      test('The Validate button is disabled if the PayID field is empty', async () => {
        await addNewPayeePage.emailPayID.click();

        await expect(addNewPayeePage.validatePayID).toBeVisible();
        await expect(addNewPayeePage.validatePayID).toBeDisabled();
      });

      test('The Validate button becomes enabled when the user enters a PayID value', async () => {
        await addNewPayeePage.emailPayID.click();

        await addNewPayeePage.payId.fill('john@example.com')
        await expect(addNewPayeePage.validatePayID).toBeEnabled();
      });

      test('The user must enter a valid email address for an email PayID', async () => {
        await addNewPayeePage.emailPayID.click();
        await addNewPayeePage.payId.fill('not-an-email.example.com');
        await addNewPayeePage.validatePayID.click();
        await expect(addNewPayeePage.errorMessage).toContainText('Please enter a valid email address');
      });

      test('The user must enter a valid mobile for a mobile PayID', async () => {
        await addNewPayeePage.mobilePayID.click();
        await addNewPayeePage.payId.fill('1234');
        await addNewPayeePage.validatePayID.click();
        await expect(addNewPayeePage.errorMessage).toContainText('Please enter a valid Australian mobile number');
      });


      test('The user must enter a valid ABN for an ABN PayID', async () => {
        await addNewPayeePage.abnPayID.click();
        await addNewPayeePage.payId.fill('1234');
        await addNewPayeePage.validatePayID.click();
        await expect(addNewPayeePage.errorMessage).toContainText('Please enter a valid 11-digit ABN');
      });

    });
  });

  test.describe('When the user validates a PayID value', async () => {

    test('And the PayID is valid the PayID details should be shown', async () => {
      await addNewPayeePage.page.route('**/api/payids/resolve', async (route) => {

        const request = route.request();
        const requestBody = JSON.parse(request.postData());

        expect(requestBody).toHaveProperty('payId');
        expect(requestBody).toHaveProperty('payIdType');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            PayID: requestBody.payId,
            payIDType: requestBody.payIdType,
            payIdOwnerCommonName: 'John Smith',
            status: 'ACTIVE',
            nppReachable: true
          })
        });
      });

      // Enter a valid email PayID identifier
      await addNewPayeePage.emailPayID.click();
      await addNewPayeePage.payId.fill('john.smith@example.com');
      await addNewPayeePage.validatePayID.click();

      // Expect the PayID to be validated successfully
      await expect(addNewPayeePage.payIdOwnerName).toContainText('John Smith');
      await expect(addNewPayeePage.payIdType).toContainText('EMAIL');
      await expect(addNewPayeePage.confirmationCheckbox).toBeVisible();

      // Add Payee button should be disabled until confirmed
      await expect(addNewPayeePage.addPayButton).toBeVisible();
      await expect(addNewPayeePage.addPayButton).toBeDisabled();
    });

    test('And the PayID is invalid an error should be displayed', async () => {
      await addNewPayeePage.page.route('**/api/payids/resolve', async (route) => {

        const request = route.request();
        const requestBody = JSON.parse(request.postData());

        expect(requestBody).toHaveProperty('payId');
        expect(requestBody).toHaveProperty('payIdType');

        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            "error": "PayIDNotFound",
            "message": "No payee was found for the provided PayID."
          })
        });
      });

      // Enter an invalid email PayID identifier
      await addNewPayeePage.emailPayID.click();
      await addNewPayeePage.payId.fill('does-not-exist@example.com');
      await addNewPayeePage.validatePayID.click();

      // Expect the PayID to be rejected
      await expect(addNewPayeePage.errorMessage).toContainText('PayID not found');
    });
  });
});