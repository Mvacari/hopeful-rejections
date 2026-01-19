import { test, expect } from '@playwright/test'

test.describe('Logout functionality', () => {
  test('should logout user and redirect to login page', async ({ page }) => {
    // Generate unique credentials for this test
    const timestamp = Date.now()
    const testEmail = `logout-test-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up and login first
    await page.goto('/login')
    
    // Fill signup form
    const signupForm = page.locator('form').filter({ hasText: 'Sign up' })
    await signupForm.locator('input[name="email"]').fill(testEmail)
    await signupForm.locator('input[name="password"]').fill(testPassword)
    await signupForm.locator('button[type="submit"]').click()

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/)

    // Click logout button
    const logoutButton = page.getByRole('button', { name: /sign out/i })
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()

    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 })

    // Verify we're on login page
    await expect(page).toHaveURL(/\/login/)

    // Verify login form is visible
    await expect(page.getByText('Log in')).toBeVisible()
  })

  test('should logout from dashboard page', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `logout-dashboard-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up
    await page.goto('/login')
    const signupForm = page.locator('form').filter({ hasText: 'Sign up' })
    await signupForm.locator('input[name="email"]').fill(testEmail)
    await signupForm.locator('input[name="password"]').fill(testPassword)
    await signupForm.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Verify dashboard is loaded
    await expect(page.getByText('Hopeful Rejections')).toBeVisible()

    // Logout
    await page.getByRole('button', { name: /sign out/i }).click()
    await page.waitForURL('**/login', { timeout: 10000 })

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should prevent access to protected pages after logout', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `logout-protected-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up and login
    await page.goto('/login')
    const signupForm = page.locator('form').filter({ hasText: 'Sign up' })
    await signupForm.locator('input[name="email"]').fill(testEmail)
    await signupForm.locator('input[name="password"]').fill(testPassword)
    await signupForm.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Logout
    await page.getByRole('button', { name: /sign out/i }).click()
    await page.waitForURL('**/login', { timeout: 10000 })

    // Try to access dashboard directly
    await page.goto('/dashboard')
    
    // Should be redirected back to login
    await page.waitForURL('**/login', { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

