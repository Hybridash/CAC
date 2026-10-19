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

test('create a Bio Bites account on the welcome screen, then log back in after signing out', async ({
  page,
}) => {
  const email = `student-${Date.now()}@gmail.com`;
  await page.goto('/');
  const welcome = page.getByTestId('welcome');
  await welcome.getByTestId('create-account').click();
  const form = welcome.getByTestId('email-account-form');
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Password', { exact: true }).fill('mitosis1');
  await form.getByRole('button', { name: 'Create account', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: /Biology is not hard/ })).toBeVisible();

  await page.goto('/profile');
  await expect(page.getByTestId('account-card')).toContainText(email);
  await page.getByRole('button', { name: 'Sign out' }).click();

  const again = page.getByTestId('welcome');
  await again.getByRole('button', { name: /Already have one\? Log in/ }).click();
  const login = again.getByTestId('email-account-form');
  await login.getByLabel('Email').fill(email);
  await login.getByLabel('Password', { exact: true }).fill('wrong-pass');
  await login.getByRole('button', { name: 'Log in', exact: true }).last().click();
  await expect(login.getByRole('alert')).toContainText('Wrong email or password');
  await login.getByLabel('Password', { exact: true }).fill('mitosis1');
  await login.getByRole('button', { name: 'Log in', exact: true }).last().click();
  // Back on the page we signed out from, with the account loaded.
  await expect(page.getByTestId('welcome')).toHaveCount(0);
  await expect(page.getByTestId('account-card')).toContainText(email);
});

test('the demo account logs in with one tap', async ({ page }) => {
  await page.goto('/');
  const welcome = page.getByTestId('welcome');
  await welcome.getByRole('button', { name: /Already have one\? Log in/ }).click();
  await welcome.getByTestId('demo-login').click();
  await expect(page.getByRole('heading', { name: /Biology is not hard/ })).toBeVisible();
  await page.goto('/profile');
  await expect(page.getByTestId('account-card')).toContainText('demo@gmail.com');
});
