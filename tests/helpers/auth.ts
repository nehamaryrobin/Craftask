import { test, type Page } from '@playwright/test';

export async function signInTestUser(page: Page) {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  test.skip(
    !email || !password,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run authenticated UI tests.',
  );

  await page.goto('http://127.0.0.1:3000/login');
  await page.getByLabel('Email address').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('http://127.0.0.1:3000/');
}

