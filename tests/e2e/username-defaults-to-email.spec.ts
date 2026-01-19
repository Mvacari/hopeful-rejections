import { test, expect } from '@playwright/test'

test.describe('Username defaults to email', () => {
  test('should set username to email address when user signs up', async ({ page }) => {
    // Generate a unique email for this test
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Navigate to login page
    await page.goto('http://localhost:3000/login')

    // Switch to signup form
    const signupButton = page.locator('button:has-text("Sign Up")')
    await signupButton.click()

    // Fill in signup form
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Submit signup form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Verify that the username is displayed as the email address
    // Check in the header avatar/username area
    const usernameDisplay = page.locator(`text=${testEmail}`)
    await expect(usernameDisplay).toBeVisible({ timeout: 5000 })
  })

  test('should display email in leaderboard when username defaults to email', async ({ page }) => {
    // Generate a unique email for this test
    const timestamp = Date.now()
    const testEmail = `leaderboard-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up
    await page.goto('http://localhost:3000/login')
    const signupButton = page.locator('button:has-text("Sign Up")')
    await signupButton.click()
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Navigate to leaderboard
    await page.goto('http://localhost:3000/leaderboard')

    // Verify email is shown in leaderboard
    const leaderboardEntry = page.locator(`text=${testEmail}`)
    await expect(leaderboardEntry).toBeVisible({ timeout: 5000 })
  })

  test('should not display "Anonymous" when username defaults to email', async ({ page }) => {
    // Generate a unique email for this test
    const timestamp = Date.now()
    const testEmail = `no-anon-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Sign up
    await page.goto('http://localhost:3000/login')
    const signupButton = page.locator('button:has-text("Sign Up")')
    await signupButton.click()
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Verify "Anonymous" is not shown anywhere on dashboard
    const anonymousText = page.locator('text="Anonymous"')
    await expect(anonymousText).not.toBeVisible()
  })
})

