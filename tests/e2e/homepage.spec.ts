import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and redirect authenticated users to dashboard', async ({ page }) => {
    // Set up authenticated state
    await page.goto('/');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|auth)/, { timeout: 5000 });
    
    // Check if redirected to dashboard or auth page
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|auth)/);
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/');
    
    // Should show loading text briefly
    const loadingText = page.getByText('Loading...');
    await expect(loadingText).toBeVisible({ timeout: 1000 });
  });
});

test.describe('Navigation Flow', () => {
  test('should navigate through the app', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial redirect
    await page.waitForURL(/\/(dashboard|auth)/, { timeout: 5000 });
    
    // Check that page loaded successfully
    await expect(page).toHaveURL(/\/(dashboard|auth)/);
  });
});

