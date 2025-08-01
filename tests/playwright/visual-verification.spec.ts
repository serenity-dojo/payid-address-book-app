import { test, expect } from '@playwright/test';

test.describe('Visual Verification', () => {
  test('should display CBA styled interface', async ({ page }) => {
    await page.goto('/');
    
    // Wait for all content to load
    await page.waitForSelector('.app-header');
    await page.waitForSelector('.tab-button');
    await page.waitForSelector('.payee-list-loading, .payee-list-empty, .payee-list');
    
    // Take a screenshot for visual verification
    await expect(page).toHaveScreenshot('cba-homepage.png');
    
    // Click on Add New Payee tab and screenshot
    await page.click('button[role="tab"]:has-text("Add New Payee")');
    await page.waitForSelector('h2:has-text("Add New Payee")');
    await expect(page).toHaveScreenshot('cba-add-payee.png');
  });
});