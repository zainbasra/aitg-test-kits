# Playwright locators kit

Test code for the article https://aitestingguide.com/playwright-locators/ (23 Nov 2026).
Target: the AITG Demo Shop, a practice shop we own (https://demo.aitestingguide.com/shop/). TypeScript only.

Tested with: @playwright/test 1.63.0, Chromium 153, Node 22, Linux.

## Files
- `tests/rename.spec.ts`: 9 ways to find the "Add to cart" button, run on the normal shop and on `?rename=1` (text, id and data-testid change). 5 of the 9 fail after the rename.
- `tests/lab.spec.ts`: 12 cases on the shop and its lab page: label, placeholder, strict mode, filter, iframe, shadow DOM, changing ids, late elements, dialog, table, new tab.

## Run
```
npm install
npx playwright install chromium
npx playwright test
```
Expected: 25 passed, 5 failed. The 5 failures are the 5 locators that break after the rename; that is the point of the test.

To use a local copy of the shop instead of the live site: `BASE_URL=http://127.0.0.1:8099/shop/ npx playwright test`.

Not tested: Firefox, WebKit, getByAltText, closed shadow roots, other language bindings, AI self-healing tools.
