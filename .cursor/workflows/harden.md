# Harden Workflow

A workflow for creating comprehensive tests after implementing a fix, ensuring the fix is robust and prevents regression.

## Steps

### 1. Analyze the Fix
- Review the code changes made in the fix
- Understand the root cause that was addressed
- Identify all affected code paths and components
- Document the expected behavior before and after the fix
- Note any edge cases or assumptions made in the fix

### 2. Create Regression Tests
- Write tests that would have caught the original bug
- Test the exact scenario that was broken before the fix
- Ensure these tests pass with the current fix
- Cover both the happy path and the failure case
- Test boundary conditions related to the bug

### 3. Add Edge Case Tests
- Identify edge cases that might trigger similar issues
- Test with empty, null, or undefined values
- Test with extreme values (very large, very small, negative)
- Test with malformed or unexpected input data
- Test concurrent or race condition scenarios if applicable

### 4. Write Integration Tests
- Test the fix in the context of the full system
- Verify the fix doesn't break related functionality
- Test data flow through the fixed component
- Test interactions with external services (APIs, databases)
- Ensure proper error handling in edge cases

### 5. Add E2E Tests (if user-facing)
- Create Playwright tests for user-facing features
- Test the complete user flow that was affected
- Verify the fix from a user's perspective
- Test across different browsers or devices if relevant
- Ensure accessibility isn't broken by the fix

### 6. Verify Test Coverage
- Run code coverage tools to check test completeness
- Ensure all branches of the fix are covered
- Add tests for any uncovered code paths
- Verify tests are deterministic and reliable
- Remove or fix any flaky tests

### 7. Document & Review
- Add comments explaining why specific tests exist
- Document the bug and fix in test descriptions
- Create examples showing correct usage
- Update documentation if behavior changed
- Add preventive measures or warnings for future developers

## Testing Strategies

### Unit Tests
- Test individual functions modified in the fix
- Mock external dependencies to isolate the fix
- Test error handling and validation logic
- Keep tests fast and focused

### Integration Tests
- Test component interactions affected by the fix
- Use real or realistic test data
- Verify state changes and side effects
- Test asynchronous behavior if applicable

### End-to-End Tests
- Test critical user flows through the fixed feature
- Simulate real user interactions
- Verify UI updates and feedback
- Test with production-like data

## Principles
- **Prevention First**: Tests should catch regressions before they reach production
- **Comprehensive Coverage**: Don't just test the happy path
- **Realistic Scenarios**: Use test data and conditions that reflect real usage
- **Maintainable**: Write clear, focused tests that are easy to understand
- **Fast Feedback**: Ensure tests run quickly and reliably

## When to Use This Workflow
- After implementing a bug fix
- When a hotfix was deployed without tests
- After discovering a production issue
- When improving legacy code without test coverage
- After a quick fix that needs hardening


