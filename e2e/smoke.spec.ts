import { expect, test } from '@playwright/test';
import { atp, completeViaApi } from './helpers';

// These tests start past the welcome screen, as a guest (welcome.spec.ts covers that screen).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('biobites.welcomed', '1'));
});

test('home loads and fuzzy search finds insulin from “blood sugar”', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Biology is not hard/ })).toBeVisible();
  const search = page.getByRole('combobox');
  await search.fill('blood sugar');
  await expect(page.getByRole('option', { name: /How Insulin Works/ })).toBeVisible();
  await search.press('Enter');
  await expect(page).toHaveURL(/\/learn\/insulin/);
  await expect(page.getByRole('heading', { name: 'How Insulin Works' })).toBeVisible();
});

test('misspellings and nicknames still work', async ({ page }) => {
  await page.goto('/library?q=jumping%20genes');
  await expect(page.getByRole('link', { name: /Transposons/ }).first()).toBeVisible();
  await page.goto('/library?q=mitocondria');
  await expect(
    page.getByRole('link', { name: /Mitochondria & Cellular Respiration/ }).first(),
  ).toBeVisible();
});

test('a data-driven lesson is fully playable with the keyboard and pays ATP from the server', async ({
  page,
}) => {
  await page.goto('/learn/thermoregulation');
  await expect.poll(() => atp(page)).toBe(0);
  const place = async (item: string) => {
    await page.getByRole('button', { name: item, exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: `Place ${item} on Hiker` }).focus();
    await page.keyboard.press('Enter');
  };
  await place('Desert sun');
  await place('Ice bath');
  await page.getByRole('radio', { name: 'Hypothalamus damaged' }).click();
  await place('Snowstorm');
  await page.getByRole('radio', { name: 'Dehydrated' }).click();
  await place('Run a race');
  await expect(page.getByTestId('interaction-complete')).toBeVisible();
  await expect.poll(() => atp(page)).toBeGreaterThan(0);
});

test('quiz is graded and rewarded', async ({ page }) => {
  await page.goto('/learn/insulin');
  const quiz = page.getByTestId('quiz');
  await quiz.getByRole('radio', { name: 'Soda' }).click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await quiz.getByRole('button', { name: /Next question/ }).click();
  await quiz.getByRole('radio', { name: /A key that unlocks/ }).click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await quiz.getByRole('button', { name: /Next question/ }).click();
  await quiz.getByRole('radio', { name: /rises and stays high/ }).click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await quiz.getByRole('button', { name: /Finish quiz/ }).click();
  await expect(page.getByTestId('quiz-result')).toContainText('3 / 3 correct');
  await expect(page.getByTestId('quiz-result')).toContainText('ATP');
});

test('earn ATP, open a pack, see the avatars in the collection', async ({ page }) => {
  await page.goto('/shop');
  await completeViaApi(page, ['insulin', 'mitosis', 'translation', 'photosynthesis']);
  await page.reload();
  await expect.poll(() => atp(page)).toBeGreaterThanOrEqual(75);
  await page.getByTestId('open-basic').click();
  await expect(page.getByTestId('pack-opening')).toBeVisible();
  await page.getByRole('button', { name: 'Reveal all' }).click();
  await expect(page.getByTestId('revealed-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Done' }).click();
  await page.goto('/collection');
  await expect(page.getByText(/of 72 avatars collected/)).toBeVisible();
  await expect(page.getByText(/^[2-4] of 72 avatars collected/)).toBeVisible();
});

test('knowledge map shows every concept and mysteries unlock with progress', async ({ page }) => {
  await page.goto('/map');
  await expect(page.locator('a[href^="/learn/"]')).toHaveCount(154);
  await page.goto('/mysteries/zombie-ants');
  await expect(page.getByText('This case file is sealed')).toBeVisible();
  await completeViaApi(page, ['zombie-fungus', 'parasites', 'fungi']);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The Ants on the Leaves' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Clues/ })).toBeVisible();
});

test('mute toggle and skip link are accessible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Mute sound effects' }).click();
  await expect(page.getByRole('button', { name: 'Unmute sound effects' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('@mobile insulin flagship works with taps on a phone', async ({ page }) => {
  await page.goto('/learn/insulin');
  const feed = async (food: string) => {
    await page.getByRole('button', { name: food, exact: true }).tap();
    await page.getByRole('button', { name: `Place ${food} on the person` }).tap();
  };
  await feed('Candy bar');
  await page.getByRole('radio', { name: /Type 1/ }).tap();
  await feed('Soda');
  await page.getByRole('radio', { name: /Type 2/ }).tap();
  await feed('Apple');
  await expect(page.getByTestId('interaction-complete')).toBeVisible();
});
