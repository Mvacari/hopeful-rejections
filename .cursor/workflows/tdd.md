# TDD Workflow

A comprehensive Test-Driven Development workflow that emphasizes research, testing, and refactoring.

## Steps

### 1. Research
- Use semantic search to find relevant code patterns
- Check for existing libraries or dependencies that can solve the problem
- Review similar features or components for consistency
- Document findings and decisions

### 2. Write Playwright Tests
- Create end-to-end tests using Playwright for user-facing features
- Test critical user flows and interactions
- Ensure tests are deterministic and isolated
- Use page object pattern for maintainability
- Test both happy paths and edge cases

### 3. Write Integration Tests
- Test component interactions and API integrations
- Verify data flow between different parts of the application
- Test with real or mocked external services (Supabase, etc.)
- Ensure proper error handling in integration scenarios
- Test authentication and authorization flows

### 4. Write Unit Tests
- Write focused unit tests for individual functions and components
- Use Jest or Vitest for unit testing
- Aim for high code coverage on business logic
- Mock external dependencies appropriately
- Keep tests fast and isolated

### 5. Implement Feature
- Write the minimum code to make tests pass
- Follow the Red-Green-Refactor cycle
- Keep implementation simple and focused
- Ensure code passes all tests (Playwright, integration, unit)

### 6. Refactor
- Improve code structure while keeping tests green
- Extract reusable components and utilities
- Improve naming and readability
- Remove duplication
- Optimize performance where needed
- Ensure all tests still pass after refactoring

## Principles
- **Red-Green-Refactor**: Write failing test → Make it pass → Refactor
- **Test First**: Write tests before implementation
- **Incremental**: Small, focused changes with tests at each step
- **Research First**: Understand existing patterns before creating new ones

