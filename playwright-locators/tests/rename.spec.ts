import { test, expect, Page, Locator } from '@playwright/test';

// Nine ways to find the "Add to cart" button for one product.
// The "rename" project loads the shop with ?rename=1: the button text becomes
// "Add to basket" and its id and data-testid change, like a real refactor.
const card = (page: Page) => page.getByTestId('product-card').filter({ hasText: 'Wireless mouse' });

const strategies: Record<string, (page: Page) => Locator> = {
  'getByRole exact name':   p => card(p).getByRole('button', { name: 'Add to cart' }),
  'getByText':              p => card(p).getByText('Add to cart'),
  'getByTestId':            p => card(p).getByTestId('add-to-cart'),
  'CSS id':                 p => p.locator('#add-to-cart-6'),
  'XPath with text':        p => p.locator("//article[.//a[text()='Wireless mouse']]//button[text()='Add to cart']"),
  'CSS class':              p => card(p).locator('button.add'),
  'getByRole regex name':   p => card(p).getByRole('button', { name: /^add to (cart|basket)$/i }),
  'getByRole, any button':  p => card(p).getByRole('button'),
  'or() fallback':          p => card(p).getByTestId('add-to-cart').or(card(p).getByTestId('basket-add')),
};

for (const [name, find] of Object.entries(strategies)) {
  test(name, async ({ page }, info) => {
    await page.goto('index.html' + (info.project.metadata.query as string));
    await find(page).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
}
