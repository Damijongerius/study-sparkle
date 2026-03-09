Playwright smoke tests (QA/DevOps)

Quick start (local):

1. Install Playwright (run from project root):
   npm i -D @playwright/test && npx playwright install --with-deps
2. Run the app (e.g. `npm run dev`) and ensure it is reachable at http://localhost:5173
3. Run smoke tests:
   npx playwright test

Notes:
- These tests are intentionally small and deterministic.
- CI: add a job to run `npx playwright test` and publish artifacts (screenshots/videos) on failure.
