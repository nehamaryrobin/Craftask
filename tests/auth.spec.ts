import { expect, test } from '@playwright/test';

test('protects private pages and renders authentication screens', async ({ page }) => {
  const response = await page.goto('http://127.0.0.1:3000');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL('http://127.0.0.1:3000/login');
  await expect(page.getByRole('heading', { name: 'Sign in to Craftask' })).toBeVisible();

  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/signup');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
});

test('switches the global interface between dark and light modes', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/login');

  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('theme-toggle').click();

  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false');

  await page.getByTestId('theme-toggle').click();

  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'true');
});

test('rejects unauthenticated API requests', async ({ request }) => {
  for (const resource of ['tasks', 'projects', 'habits']) {
    const response = await request.get(`http://127.0.0.1:3000/api/${resource}`);

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }
});
