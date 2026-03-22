// Playwright test fixtures
// Extend or customize test/expect here if needed
import { test as base, expect } from '@playwright/test';

// Export extended test and expect for use in tests
export const test = base.extend({
  // Add custom fixtures here if needed
});

export { expect };
