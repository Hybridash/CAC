import type { Page } from '@playwright/test';
import { CONCEPT_BY_ID } from '../shared/src/index';

/** Complete a concept (interaction + perfect quiz) through the API as the page's player. */
export async function completeViaApi(page: Page, ids: string[]) {
  await page.waitForFunction(() => !!localStorage.getItem('bioplay.token'));
  const token = await page.evaluate(() => localStorage.getItem('bioplay.token'));
  const headers = { Authorization: `Bearer ${token}` };
  for (const id of ids) {
    const answers = CONCEPT_BY_ID[id].quiz.map((q) =>
      q.kind === 'label' ? q.pairs.map((_, i) => i) : q.answer,
    );
    await page.request.post(`/api/concepts/${id}/interaction`, { headers, data: {} });
    await page.request.post(`/api/concepts/${id}/quiz`, { headers, data: { answers } });
  }
}

export const atp = async (page: Page) =>
  Number(await page.getByTestId('atp-balance').textContent());
