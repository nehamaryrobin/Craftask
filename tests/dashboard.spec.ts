import { test, expect } from '@playwright/test';

test('dashboard layout and task workflows', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3000');
  await page.getByRole('button', { name: 'Today', exact: false }).first().click();
  await expect(page.getByRole('heading', { name: 'Good morning, Neha' })).toBeVisible();
  await page.screenshot({ path: '/private/tmp/craftask-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Complete Finish the Craftask dashboard wireframes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reopen Finish the Craftask dashboard wireframes', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Task name').fill('Review the Craftask mockup');
  await page.getByRole('dialog').getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByText('Review the Craftask mockup', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Check in Read a little', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Uncheck Read a little' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Meta+k');
  await page.getByRole('dialog').getByRole('textbox').fill('Review the Craftask mockup');
  await expect(page.getByRole('dialog').getByText('Review the Craftask mockup')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await page.getByRole('button', { name: 'Inbox', exact: true }).click();
  await expect(page.getByText('Capture now, find your focus later.', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile navigation and layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:3000');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({path:'/private/tmp/craftask-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Open menu'}).click();
  await page.getByRole('button',{name:'Habits',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Habits',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Add task',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
