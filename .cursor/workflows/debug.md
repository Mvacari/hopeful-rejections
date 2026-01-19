# Debug Workflow

A systematic debugging workflow that isolates errors step by step, similar to TDD methodology.

## Steps

### 1. Reproduce the Error
- Identify the exact conditions that trigger the error
- Document error messages, stack traces, and console logs
- Note the environment (dev/prod) and browser/OS if relevant
- Capture screenshots or network requests if applicable
- Create a minimal reproduction case if possible

### 2. Research & Understand
- Search the codebase for similar errors or patterns
- Check error logs and monitoring tools
- Review recent changes that might have introduced the bug
- Look for existing solutions or workarounds
- Check documentation and dependencies for known issues

### 3. Isolate the Problem
- Use binary search to narrow down the problematic code
- Add strategic console.logs or breakpoints
- Comment out sections to identify the failing component
- Test individual functions or components in isolation
- Use debugging tools (browser DevTools, VS Code debugger)

### 4. Write Failing Test
- Create a test that reproduces the bug (similar to TDD red phase)
- This test should fail with the current buggy behavior
- Make the test specific and focused on the error case
- Include edge cases related to the bug

### 5. Identify Root Cause
- Trace through the execution flow
- Check data transformations and state changes
- Verify assumptions about data types and structures
- Check for race conditions or timing issues
- Review error boundaries and exception handling

### 6. Fix the Issue
- Implement the minimal fix to resolve the bug
- Ensure the fix addresses the root cause, not just symptoms
- Make the previously failing test pass (TDD green phase)
- Verify no regressions in existing functionality

### 7. Verify & Test
- Run all relevant tests (unit, integration, e2e)
- Test the fix in the original error scenario
- Test related edge cases
- Verify fix works across different environments
- Check for similar issues elsewhere in codebase

### 8. Refactor & Document
- Clean up any debugging code or temporary fixes
- Improve error messages and logging if needed
- Add comments explaining the fix if non-obvious
- Update documentation if the fix changes behavior
- Consider preventive measures to avoid similar bugs

## Debugging Tools & Techniques
- **Browser DevTools**: Network tab, Console, Sources, Application
- **VS Code Debugger**: Breakpoints, watch expressions, call stack
- **Logging**: Strategic console.logs, error tracking (Sentry, etc.)
- **Testing**: Write tests to reproduce and verify fixes
- **Code Search**: Use grep and semantic search to find related code

## Principles
- **Isolate First**: Narrow down the problem systematically
- **Test-Driven Debugging**: Write tests to reproduce and verify fixes
- **Root Cause**: Fix the underlying issue, not just symptoms
- **Document**: Record findings and solutions for future reference

