import { expect, test } from '@playwright/test';
import { AVATAR_BY_ID, CONCEPT_BY_ID } from '@bioplay/shared';
import { atp, completeViaApi } from './helpers';

// These tests start past the welcome screen, as a guest (welcome.spec.ts covers that screen).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('biobites.welcomed', '1'));
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

test('a wrong answer explains itself, and the result lists what was missed', async ({ page }) => {
  await page.goto('/learn/insulin');
  const quiz = page.getByTestId('quiz');
  await quiz.getByRole('radio', { name: 'Soda' }).click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await quiz.getByRole('button', { name: /Next question/ }).click();
  await quiz
    .getByRole('radio')
    .filter({ hasNotText: /A key that unlocks/ })
    .first()
    .click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  const feedback = quiz.getByRole('status').filter({ hasText: 'Not quite.' });
  await expect(feedback).toContainText('You chose:');
  await expect(feedback).toContainText(/Right answer:.*A key that unlocks/);
  await quiz.getByRole('button', { name: /Next question/ }).click();
  await quiz.getByRole('radio', { name: /rises and stays high/ }).click();
  await quiz.getByRole('button', { name: 'Check answer' }).click();
  await quiz.getByRole('button', { name: /Finish quiz/ }).click();

  const review = page.getByTestId('quiz-review');
  await expect(review).toContainText('Question 2');
  await expect(review).toContainText(/A key that unlocks/);
  await expect(review).not.toContainText('Question 1');
});

test('earn ATP, open a pack, see the avatars in the collection', async ({ page }) => {
  await page.goto('/shop');
  await completeViaApi(page, ['insulin', 'mitosis', 'translation', 'photosynthesis']);
  await page.reload();
  await expect.poll(() => atp(page)).toBeGreaterThanOrEqual(75);
  await page.getByTestId('open-basic').click();
  await expect(page.getByTestId('pack-opening')).toBeVisible();
  // Tap the floating pack four times to roll its rarity upgrades.
  const pack = page.getByTestId('pack-tap');
  for (let left = 3; left >= 0; left--) {
    // Taps during the previous tap's animation are ignored, so retry until this one lands.
    await expect(async () => {
      // The pack never holds still (it floats and shakes), so skip the "stable" wait.
      await pack.click({ force: true });
      await expect(pack).toHaveAccessibleName(left ? new RegExp(`${left} taps? left`) : /opening/, {
        timeout: 300,
      });
    }).toPass();
  }
  await page.getByRole('button', { name: 'Reveal all' }).click();
  const cards = page.getByTestId('revealed-card');
  await expect(cards).toHaveCount(3);
  // Nothing is equipped automatically: pick the second card, then equip it.
  await expect(page.getByRole('button', { name: /^Equip / })).toHaveCount(0);
  await cards.nth(1).click();
  await expect(cards.nth(1)).toHaveAttribute('aria-pressed', 'true');
  const label = (await cards.nth(1).getAttribute('aria-label'))!;
  const name = label.split(',')[0];
  await page.getByRole('button', { name: `Equip ${name}` }).click();
  await expect(page.getByTestId('pack-opening')).toHaveCount(0);
  const equipped = await page.evaluate(async () => {
    const token = localStorage.getItem('bioplay.token');
    const s = await fetch('/api/state', { headers: { Authorization: `Bearer ${token}` } });
    return (await s.json()).equippedAvatar as string;
  });
  expect(AVATAR_BY_ID[equipped]?.name).toBe(name);
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

test('the sidebar collapses to icons, still navigates, and stays collapsed after a reload', async ({
  page,
}) => {
  await page.goto('/');
  const rail = page.getByTestId('rail');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(rail).toHaveCSS('width', '64px');
  await rail.getByRole('link', { name: 'Library' }).click();
  await expect(page).toHaveURL(/\/library/);

  await page.reload();
  await expect(rail).toHaveCSS('width', '64px');
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(rail).toHaveCSS('width', '240px');
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

test('High School section: open a lesson and explore its diagram', async ({ page }) => {
  await page.goto('/library');
  await page.getByTestId('tab-high-school').click();
  await expect(page.getByRole('heading', { name: 'High School Biology' })).toBeVisible();
  await page
    .getByRole('link', { name: /Enzymes & Activation Energy/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/learn\/hs-enzymes/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Enzymes & Activation Energy' }),
  ).toBeVisible();
  const diagram = page.getByTestId('hs-diagram');
  await expect(diagram).toBeVisible();
  await diagram.getByRole('button', { name: /Reactants/ }).click();
  await expect(diagram).toContainText('An enzyme does not change this level');
  await page.getByRole('tab', { name: /Induced fit/ }).click();
  await expect(page.getByTestId('hs-diagram')).toContainText('Induced fit at the active site');
  // The simpler library version is linked, and links back here.
  await page.getByRole('link', { name: /Simpler version/ }).click();
  await expect(page).toHaveURL(/\/learn\/enzymes$/);
  await page.getByTestId('hs-version-link').click();
  await expect(page).toHaveURL(/\/learn\/hs-enzymes/);
});

test('Bio Bot opens on a lesson page', async ({ page }) => {
  await page.goto('/learn/insulin');
  await page.getByTestId('open-chat').click();
  const panel = page.getByTestId('chat-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('bot-message').first()).toContainText('How Insulin Works');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});

test('a lesson can be played in full screen, and the quiz button leaves full screen', async ({
  page,
}) => {
  await page.goto('/learn/mutations');
  const stage = page.getByRole('region', { name: 'Interactive' });
  await page.getByTestId('stage-fullscreen').click();
  await expect(page.getByRole('button', { name: /Exit full screen/ })).toBeVisible();
  // The stage covers the whole window (native full screen or the overlay fallback).
  const box = await stage.boundingBox();
  const vp = page.viewportSize()!;
  expect(box?.width).toBe(vp.width);
  expect(box?.height).toBe(vp.height);

  // Sort every card from the deck into its bin.
  const it = CONCEPT_BY_ID.mutations.interaction;
  if (it.template !== 'sorting') throw new Error('mutations should be a sorting lesson');
  const binLabel = Object.fromEntries(it.config.bins.map((b) => [b.id, b.label]));
  for (let i = 0; i < it.config.items.length; i++) {
    const name = await stage
      .getByRole('button', { name: /^Sort .* into / })
      .first()
      .getAttribute('aria-label');
    const item = it.config.items.find((x) => name?.startsWith(`Sort ${x.label} into`))!;
    await stage
      .getByRole('button', { name: `Sort ${item.label} into ${binLabel[item.bin]}` })
      .click();
  }
  await expect(stage.getByTestId('interaction-complete')).toBeVisible();

  await stage.getByRole('button', { name: /Take the quiz/ }).click();
  await expect(page.getByTestId('stage-fullscreen')).toHaveText(/^Full screen$/);
  await expect(page.getByTestId('quiz')).toBeInViewport();
});

test('Bio Olympiad: filter practice questions, then take and review a test', async ({ page }) => {
  await page.goto('/olympiad');
  await expect(page.getByRole('heading', { level: 1, name: 'Bio Olympiad' })).toBeVisible();

  // Practice: filter to genetics data questions, answer one and see the explanation.
  await page.getByTestId('oly-practice').click();
  await page
    .getByRole('group', { name: 'Topic' })
    .getByRole('button', { name: /Genetics/ })
    .click();
  await page
    .getByRole('group', { name: 'Skill' })
    .getByRole('button', { name: 'Data analysis' })
    .click();
  await expect(page).toHaveURL(/topic=genetics/);
  const count = await page.getByTestId('oly-question').count();
  expect(count).toBeGreaterThan(0);
  const card = page.getByTestId('oly-question').first();
  await card.getByRole('radio').first().click();
  await card.getByRole('button', { name: 'Check answer' }).click();
  await expect(card.getByRole('status')).toContainText(/point/);

  // A ready-made test: answer the first question, submit, and review.
  await page.goto('/olympiad/test/quick-10');
  await page.getByTestId('oly-start').click();
  const test = page.getByTestId('oly-test');
  await expect(test.getByText('Question 1 of 10')).toBeVisible();
  await test.getByRole('radio').first().click();
  await page.keyboard.press('ArrowRight');
  await expect(test.getByText('Question 2 of 10')).toBeVisible();

  // A refresh keeps the test in progress.
  await page.reload();
  await expect(page.getByTestId('oly-test').getByText('Question 2 of 10')).toBeVisible();

  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.getByTestId('oly-submit').click();
  await expect(page.getByTestId('oly-review')).toBeVisible();
  await expect(page.getByTestId('oly-score')).toContainText('/ 10 points');

  // The result is listed on the Bio Olympiad page.
  await page.goto('/olympiad');
  await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
});
