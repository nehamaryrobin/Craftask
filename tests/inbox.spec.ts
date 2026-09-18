import { test, expect } from '@playwright/test';

test('empty inbox, inline capture, details, and completion', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  await expect(page.getByRole('heading', { name: 'Inbox', exact: true })).toBeVisible();
  await expect(page.getByText('Capture now, find your focus later.')).toBeVisible();
  await page.screenshot({path:'/private/tmp/craftask-inbox-empty.png',fullPage:true});
  await page.getByRole('button', {name:'Add task',exact:true}).click();
  await expect(page.getByRole('button',{name:'Save task'})).toBeDisabled();
  await page.getByRole('textbox',{name:'Task name'}).fill('Buy supplies for the road trip');
  await page.getByRole('button',{name:'Add task details'}).click();
  for(const name of ['Description','Attachment','Priority','Reminders','Labels','Deadline','Location']) {
    await expect(page.getByRole('button',{name,exact:true})).toBeVisible();
  }
  await page.screenshot({path:'/private/tmp/craftask-inbox-menu.png',fullPage:true});
  await page.getByRole('button',{name:'Description',exact:true}).click();
  await page.getByRole('textbox',{name:'Description',exact:true}).fill('Snacks, water, and a first-aid kit');
  await page.getByRole('button',{name:'Add task details'}).click();
  await page.getByRole('button',{name:'Priority',exact:true}).click();
  await page.getByLabel('Priority',{exact:true}).selectOption('high');
  await page.getByRole('button',{name:'Task date',exact:true}).click();
  await page.getByRole('textbox',{name:'Type a date'}).fill('2026-09-18');
  await page.getByRole('button',{name:'Apply typed date'}).click();
  await page.getByRole('heading',{name:'Inbox',exact:true}).click();
  await page.getByRole('button',{name:'Save task'}).click();
  await expect(page.getByText('Buy supplies for the road trip',{exact:true})).toBeVisible();
  await expect(page.getByText('Snacks, water, and a first-aid kit')).toBeVisible();
  await expect(page.getByText('2026-09-18',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Complete Buy supplies for the road trip'}).click();
  await expect(page.getByText('Capture now, find your focus later.')).toBeVisible();
  await page.getByRole('button',{name:'Add task',exact:true}).click();
  await page.getByRole('button',{name:'Cancel task'}).click();
  await expect(page.getByText('Capture now, find your focus later.')).toBeVisible();
});

test('inbox composer fits mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:3000');
  await page.getByRole('button',{name:'Add task',exact:true}).click();
  await page.getByRole('textbox',{name:'Task name'}).fill('Plan a little adventure');
  await page.getByRole('button',{name:'Add task details'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'/private/tmp/craftask-inbox-mobile.png',fullPage:true});
});
