// Visual capture for UI Verify. VISUAL=b switches the shop to the changed look before capturing.
const { test } = require('@uiverify/playwright');
test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
  await request.post('/api/visual?v=' + (process.env.VISUAL === 'b' ? 'b' : 'a'));
});
test('shop home', async ({ page, uiVerify }) => { await page.goto('/'); await uiVerify.snapshot('shop-home'); });
test('product page', async ({ page, uiVerify }) => { await page.goto('/product/1'); await uiVerify.snapshot('product-keyboard'); });
test('cart with item', async ({ page, uiVerify }) => {
  await page.goto('/product/1'); await page.getByRole('button', { name: 'Add to cart' }).click();
  await uiVerify.snapshot('cart-with-item');
});
test('checkout', async ({ page, uiVerify }) => { await page.goto('/checkout'); await uiVerify.snapshot('checkout'); });
