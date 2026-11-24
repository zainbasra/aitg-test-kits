import { test, expect } from '@playwright/test';

test('getByLabel and getByRole: log in', async ({ page }) => {
  await page.goto('login.html');
  await page.getByLabel('Email').fill('demo@aitg.test');
  await page.getByLabel('Password').fill('Demo123!');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
});

test('getByPlaceholder: search', async ({ page }) => {
  await page.goto('index.html');
  await page.getByPlaceholder('Search products').fill('mouse');
  await expect(page.getByTestId('result-count')).toHaveText('2 products');
});

test('strict mode: an ambiguous locator throws', async ({ page }) => {
  await page.goto('index.html');
  const all = page.getByRole('button', { name: 'Add to cart' });
  await expect(all).toHaveCount(11);
  const err = await all.click().catch(e => e as Error);
  expect(String(err)).toContain('strict mode violation');
});

test('filter({ has }) finds the sold-out card', async ({ page }) => {
  await page.goto('index.html');
  const soldOut = page.getByTestId('product-card').filter({ has: page.getByRole('button', { name: 'Sold out' }) });
  await expect(soldOut).toHaveCount(1);
  await expect(soldOut.getByRole('heading')).toHaveText('Compact keyboard');
});

test('iframe: contentFrame() then normal locators', async ({ page }) => {
  await page.goto('lab.html');
  const frame = page.getByTitle('Newsletter form').contentFrame();
  await frame.getByLabel('Newsletter email (inside iframe)').fill('me@example.test');
  await frame.getByRole('button', { name: 'Join' }).click();
  await expect(frame.getByText('Thanks! (fake, nothing was sent)')).toBeVisible();
});

test('iframe: a page-level locator does not see inside the frame', async ({ page }) => {
  await page.goto('lab.html');
  await expect(page.getByRole('button', { name: 'Join' })).toHaveCount(0);
});

test('shadow DOM: getByRole and CSS pierce it, XPath does not', async ({ page }) => {
  await page.goto('lab.html');
  await expect(page.locator('xpath=//button[contains(., "Like")]')).toHaveCount(0);
  await expect(page.locator('aitg-rating button')).toHaveCount(1);
  await page.getByRole('button', { name: 'Like' }).click();
  await expect(page.getByTestId('rating')).toHaveText('1 like');
});

test('changing ids: id differs per load, getByRole still works', async ({ page }) => {
  await page.goto('lab.html');
  const id1 = await page.getByRole('button', { name: 'Save settings' }).getAttribute('id');
  await page.reload();
  const id2 = await page.getByRole('button', { name: 'Save settings' }).getAttribute('id');
  expect(id1).not.toBe(id2);
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByTestId('dynamic-result')).toHaveText('Settings saved');
});

test('late element: web-first assertion waits, textContent() does not', async ({ page }) => {
  await page.goto('lab.html');
  await page.getByRole('button', { name: 'Load message' }).click();
  const now = await page.getByTestId('late-message').textContent();
  expect(now).toBe('Loading…');
  await expect(page.getByTestId('late-message')).toHaveText('Hello from the server!');
});

test('in-page dialog: getByRole("dialog")', async ({ page }) => {
  await page.goto('lab.html');
  await page.getByRole('button', { name: 'Delete item' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete this item?' });
  await dialog.getByRole('button', { name: 'Yes, continue' }).click();
  await expect(page.getByTestId('modal-result')).toHaveText('Item deleted');
});

test('table: filter rows by text, read a cell', async ({ page }) => {
  await page.goto('lab.html');
  const bilal = page.getByRole('row').filter({ hasText: 'Bilal' });
  await expect(bilal.getByRole('cell').nth(1)).toHaveText('95');
  await page.getByRole('button', { name: 'Score' }).click();
  await expect(page.getByRole('row').nth(1)).toContainText('Bilal');
});

test('new tab: waitForEvent("page")', async ({ page, context }) => {
  await page.goto('lab.html');
  const [help] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Open help (new tab)' }).click(),
  ]);
  await expect(help.getByTestId('help-title')).toBeVisible();
});
