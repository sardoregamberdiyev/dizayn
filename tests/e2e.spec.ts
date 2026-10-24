import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.page,
    `Page width ${dimensions.page}px should fit ${dimensions.viewport}px viewport`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test('homepage loads local artwork and navigation on the current viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Coffee Shop home' }).first()).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Explore Coffee Shop' })).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /The coffee/ })
    .click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(page.locator('.product-card')).toHaveCount(6);
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('catalog search and origin filters show matching and empty results', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('textbox', { name: 'Search coffee', exact: true }).fill('java');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card h3')).toHaveText('Java Arabica');
  await page.getByRole('textbox', { name: 'Search coffee', exact: true }).fill('no-such-coffee');
  await expect(page.getByRole('heading', { name: 'No beans found. Yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(6);
  const mobileFilters = page.getByRole('button', { name: 'Filters', exact: true });
  if (await mobileFilters.isVisible()) await mobileFilters.click();
  await page.getByRole('combobox', { name: 'Origin', exact: true }).selectOption('Bali');
  const apply = page.getByRole('button', { name: /Show 1 coffees/ });
  if (await apply.isVisible()) await apply.click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card h3')).toHaveText('Bali Kintamani');
  await expectNoHorizontalOverflow(page);
});

test('selected variants survive reload and produce a correctly priced demo order', async ({
  page,
}) => {
  await page.goto('/product/java-arabica');
  await page.getByRole('button', { name: '500g', exact: true }).click();
  await page
    .getByRole('combobox', { name: '02 / How do you brew?', exact: true })
    .selectOption('Filter');
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.getByRole('button', { name: 'Add to bag — $62.90', exact: true }).click();
  await page.goto('/cart');
  await expect(page.locator('.commerce-cart-item')).toHaveCount(1);
  await expect(page.locator('.commerce-cart-item')).toContainText('500g / Filter');
  await expect(page.locator('.commerce-cart-item-controls strong')).toHaveText('$62.90');
  await page.reload();
  await expect(page.locator('.commerce-cart-item-controls strong')).toHaveText('$62.90');
  await page.getByPlaceholder('Promo code', { exact: true }).fill('COFFEE10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.commerce-summary-total strong')).toHaveText('$56.61');
  await page
    .locator('.commerce-summary')
    .getByRole('link', { name: 'Checkout', exact: true })
    .click();
  await page.getByLabel('Full name', { exact: true }).fill('Alex Demo');
  await page.getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await page.getByLabel('Street address', { exact: true }).fill('12 Sample Street');
  await page.getByLabel('City', { exact: true }).fill('Tashkent');
  await page.getByLabel('Postal code', { exact: true }).fill('100000');
  await page.getByRole('combobox', { name: 'Country', exact: true }).selectOption('Uzbekistan');
  await page.getByRole('button', { name: 'Continue to delivery', exact: true }).click();
  await page.getByRole('button', { name: 'Review your order', exact: true }).click();
  await page
    .getByRole('checkbox', {
      name: 'I understand this is a demo order with no actual payment or delivery.',
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Place demo order — $56.61', exact: true }).click();
  await expect(page).toHaveURL(/\/order-success\?order=CS-/);
  await expect(page.getByRole('heading', { name: /Your morning.*just got better/ })).toBeVisible();
  await expect(page.locator('.commerce-success-details')).toContainText('$56.61');
  await expect(page.getByRole('button', { name: 'Open shopping bag, 0 items' })).toBeVisible();
  await page.reload();
  await expect(page.locator('.commerce-success-details')).toContainText('$56.61');
  await expectNoHorizontalOverflow(page);
});

test('wishlist choices persist and can be removed', async ({ page }) => {
  await page.goto('/product/sumatra-arabica');
  await page.getByRole('button', { name: 'Add to wishlist', exact: true }).click();
  await page.goto('/wishlist');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card h3')).toHaveText('Sumatra Arabica');
  await page.reload();
  await expect(page.locator('.product-card h3')).toHaveText('Sumatra Arabica');
  await page
    .getByRole('button', { name: 'Remove Sumatra Arabica from wishlist', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'A little space for your favorites.' }),
  ).toBeVisible();
});

test('admin edits update the local product catalog and persist', async ({ page }) => {
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'Edit Java Arabica', exact: true }).click();
  await page.getByLabel('Product name', { exact: true }).fill('Java Morning Edition');
  await page.getByLabel('Price / 250g (USD)', { exact: true }).fill('22');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Edit Java Morning Edition', exact: true }),
  ).toBeVisible();
  await page.goto('/product/java-arabica');
  await expect(
    page.getByRole('heading', { name: 'Java Morning Edition', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.commerce-detail-price')).toContainText('$22.00');
  await expectNoHorizontalOverflow(page);
});

test('a subscription activates after checkout and can be paused in the account', async ({
  page,
}) => {
  await page.goto('/account/auth');
  await page.getByLabel('Email address', { exact: true }).fill('routine@example.com');
  await page.getByRole('button', { name: 'Continue to demo account', exact: true }).click();
  await page.goto('/subscription');
  await page.locator('.subscription-options button').filter({ hasText: 'Java Arabica' }).click();
  await page.getByRole('button', { name: 'Choose your rhythm', exact: true }).click();
  await page.getByRole('radio', { name: '500g', exact: true }).check();
  await page.getByRole('button', { name: 'Review my plan', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to checkout', exact: true }).click();
  await expect(page.locator('.commerce-checkout-summary')).toContainText('$28.31');
  await page.getByLabel('Full name', { exact: true }).fill('Routine Demo');
  await page.getByLabel('Street address', { exact: true }).fill('10 Sample Road');
  await page.getByLabel('City', { exact: true }).fill('Tashkent');
  await page.getByLabel('Postal code', { exact: true }).fill('100000');
  await page.getByRole('button', { name: 'Continue to delivery', exact: true }).click();
  await page.getByRole('button', { name: 'Review your order', exact: true }).click();
  await page
    .getByRole('checkbox', {
      name: 'I understand this is a demo order with no actual payment or delivery.',
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Place demo order — $33.31', exact: true }).click();
  await expect(page).toHaveURL(/\/order-success\?order=CS-/);
  await page.goto('/account?tab=subscriptions');
  await expect(page.locator('.account-plans article')).toHaveCount(1);
  await expect(page.locator('.account-plans article')).toContainText('Java Arabica');
  await page.getByRole('button', { name: 'Pause plan', exact: true }).click();
  await expect(page.locator('.account-plans .eyebrow')).toHaveText('Paused');
  await page.reload();
  await expect(page.locator('.account-plans .eyebrow')).toHaveText('Paused');
  await page.getByRole('button', { name: 'Resume plan', exact: true }).click();
  await expect(page.locator('.account-plans .eyebrow')).toHaveText('Active');
});

test('malformed browser storage recovers without breaking the storefront or admin', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('coffee-corruption-test')) return;
    for (const key of ['products', 'cart', 'orders', 'subscriptions', 'wishlist'])
      localStorage.setItem(`coffee-shop.v1.${key}`, '[null]');
    localStorage.setItem('coffee-shop.v1.user', JSON.stringify({ name: null, email: false }));
    localStorage.setItem('coffee-shop.v1.currency', '"INVALID"');
    sessionStorage.setItem('coffee-corruption-test', '1');
  });
  await page.goto('/shop');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Open shopping bag, 0 items' })).toBeVisible();
  await expect(page.locator('.product-price').first()).toHaveText('$18.00');
  await page.goto('/admin');
  await expect(page.locator('h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('coffee-shop.v1.orders') || 'null')),
  ).toEqual([]);
});
