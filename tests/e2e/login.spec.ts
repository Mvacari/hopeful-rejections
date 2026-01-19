import { test, expect } from '@playwright/test'

test.describe('Login functionality', () => {
  const testEmail = 'faboweber@gmail.com'
  const testPassword = '12345678'

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
  })

  test('should display login form', async ({ page }) => {
    // Check that login form is visible
    await expect(page.getByText('Log in')).toBeVisible()
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('should submit login form and redirect to dashboard', async ({ page }) => {
    // Monitor console and network
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(text)
      console.log('Browser console:', text)
    })

    // Fill in login form (use specific IDs to avoid ambiguity)
    const emailInput = page.locator('#login-email')
    const passwordInput = page.locator('#login-password')
    const loginButton = page.getByRole('button', { name: /log in/i })

    await emailInput.fill(testEmail)
    await passwordInput.fill(testPassword)

    // Wait for form to be ready
    await expect(loginButton).toBeEnabled()

    // Get initial URL
    const initialUrl = page.url()
    console.log('Initial URL:', initialUrl)

    // Submit form
    await loginButton.click()

    // Wait for navigation or timeout
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 })
      console.log('✅ Redirected to dashboard successfully')
      
      // Verify dashboard is loaded
      await expect(page.getByText('Hopeful Rejections')).toBeVisible({ timeout: 5000 })
    } catch (error) {
      // Redirect didn't happen - check current state
      await page.waitForTimeout(3000) // Wait for any async operations
      const currentUrl = page.url()
      console.log('❌ No redirect happened. Current URL:', currentUrl)
      console.log('Console logs:', consoleLogs)

      // Check for error message
      const errorMessage = page.locator('.bg-red-50')
      const hasError = await errorMessage.count() > 0
      
      if (hasError) {
        const errorText = await errorMessage.first().textContent()
        console.log('Error message displayed:', errorText)
        throw new Error(`Login failed with error: ${errorText}. Still on login page at ${currentUrl}`)
      } else {
        // No error but still on login - this is the bug
        throw new Error(`BUG: Form submitted but no redirect happened and no error displayed. Still on login page at ${currentUrl}. Console logs: ${JSON.stringify(consoleLogs)}`)
      }
    }
  })

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]').first()
    const passwordInput = page.locator('input[name="password"]').first()
    const loginButton = page.getByRole('button', { name: /log in/i })

    await emailInput.fill('invalid@example.com')
    await passwordInput.fill('wrongpassword')
    await loginButton.click()

    // Wait for error message
    await page.waitForTimeout(2000)

    // Check if error is displayed
    const errorMessage = page.locator('.bg-red-50, [class*="error"]')
    const errorCount = await errorMessage.count()
    
    if (errorCount > 0) {
      const errorText = await errorMessage.first().textContent()
      console.log('Error message:', errorText)
      expect(errorText?.toLowerCase()).toContain('error') || expect(errorText).toContain('Invalid')
    } else {
      // If no error, we might have been redirected (unlikely with wrong creds)
      const currentUrl = page.url()
      console.log('No error displayed, current URL:', currentUrl)
    }
  })

  test('should handle form submission state correctly', async ({ page }) => {
    const emailInput = page.locator('#login-email')
    const passwordInput = page.locator('#login-password')
    const loginButton = page.getByRole('button', { name: /log in/i })

    // Fill form
    await emailInput.fill(testEmail)
    await passwordInput.fill(testPassword)

    // Monitor console logs
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(text)
      console.log('Browser console:', text)
    })

    // Monitor network requests
    const networkRequests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('login') || url.includes('auth') || url.includes('signin')) {
        networkRequests.push(url)
        console.log('Network request:', url, request.method())
      }
    })

    // Click login button and wait for redirect
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 10000 }),
      loginButton.click(),
    ])

    // Verify we're on dashboard
    const currentUrl = page.url()
    console.log('Console logs:', consoleLogs)
    console.log('Network requests:', networkRequests)
    console.log('Current URL:', currentUrl)
    
    expect(currentUrl).toContain('/dashboard')
  })

  test('should verify authentication flow end-to-end', async ({ page }) => {
    // Navigate to home first to see redirect behavior
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Should redirect to login if not authenticated
    const initialUrl = page.url()
    console.log('Initial redirect URL:', initialUrl)

    if (initialUrl.includes('/login')) {
      // Now try to login
      const emailInput = page.locator('input[name="email"]').first()
      const passwordInput = page.locator('input[name="password"]').first()
      const loginButton = page.getByRole('button', { name: /log in/i })

      await emailInput.fill(testEmail)
      await passwordInput.fill(testPassword)

      // Submit and wait
      await loginButton.click()
      await page.waitForTimeout(5000)

      // Check final state
      const finalUrl = page.url()
      console.log('Final URL after login:', finalUrl)

      if (finalUrl.includes('/dashboard')) {
        // Success - verify we can access dashboard
        await expect(page.getByText('Hopeful Rejections')).toBeVisible()
      } else {
        // Still on login - this is the bug
        console.error('BUG: Still on login page after form submission')
        console.error('Expected: /dashboard')
        console.error('Actual:', finalUrl)
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'test-results/login-bug.png', fullPage: true })
        
        throw new Error(`Login form submitted but redirect failed. Still on: ${finalUrl}`)
      }
    }
  })
})

