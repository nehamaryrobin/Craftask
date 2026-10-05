import { test, expect } from '@playwright/test';
import { signInTestUser } from './helpers/auth';

test('dashboard layout and task workflows', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await signInTestUser(page);
  await page.getByRole('button', { name: 'Today', exact: false }).first().click();
  await expect(page.getByRole('heading', { name: /Good morning,/ })).toBeVisible();
  await page.screenshot({ path: '/private/tmp/craftask-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  const taskName = `Review the Craftask mockup ${Date.now()}`;
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Task name').fill(taskName);
  await page.getByRole('dialog').getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByText(taskName, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: `Complete ${taskName}`, exact: true }).click();
  await expect(page.getByRole('button', { name: `Reopen ${taskName}`, exact: true })).toBeVisible();
  await page.keyboard.press('Meta+k');
  await page.getByRole('dialog').getByRole('textbox').fill(taskName);
  await expect(page.getByRole('dialog').getByText(taskName)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await page.getByRole('button', { name: 'Inbox', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inbox', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile navigation and layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await signInTestUser(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({path:'/private/tmp/craftask-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Open menu'}).click();
  await page.getByRole('button',{name:'Habits',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Habits',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Add task',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
