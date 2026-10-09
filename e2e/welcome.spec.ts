import { expect, test } from '@playwright/test';

test('first launch shows the welcome screen; guests go straight in and stay in', async ({
  page,
}) => {
  await page.goto('/');
  const welcome = page.getByTestId('welcome');
  await expect(welcome.getByRole('heading', { name: 'Bio Bites' })).toBeVisible();
  await expect(welcome.getByRole('button', { name: 'Sign in with Apple' })).toBeVisible();
  await expect(welcome.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();

  await welcome.getByRole('button', { name: 'Continue as guest' }).click();
  await expect(page.getByRole('heading', { name: /Biology is not hard/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: /Biology is not hard/ })).toBeVisible();
  await expect(page.getByTestId('welcome')).toHaveCount(0);
});

test('sign-in that isn’t set up explains itself and stays on the welcome screen', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  await expect(page.getByRole('alert')).toContainText('isn’t set up');
  await expect(page.getByTestId('welcome')).toBeVisible();
});
