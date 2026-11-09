import { test, expect, type Page } from '@playwright/test';

/** Generates a fake floor plan in the browser (never commit a real one, Constitution I). */
async function fakeFloorPlan(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 600;
    const g = c.getContext('2d')!;
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 1000, 600);
    g.strokeStyle = '#333';
    g.lineWidth = 8;
    g.strokeRect(20, 20, 960, 560);
    g.beginPath(); g.moveTo(500, 20); g.lineTo(500, 580); g.stroke();
    return c.toDataURL('image/png');
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

test('spec001_spec002_spec004 upload plan, add plant, water it, get calendar', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: /upload floor plan/i })).toBeVisible();

  await page.getByTestId('plan-input').setInputFiles({ name: 'plan.png', mimeType: 'image/png', buffer: await fakeFloorPlan(page) });
  await expect(page.getByRole('img', { name: 'Floor plan' })).toBeVisible();

  await page.getByRole('button', { name: /edit map: off/i }).click();
  const frame = page.locator('.map__frame');
  const box = (await frame.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.5);

  const dialog = page.getByRole('dialog', { name: 'Add plant' });
  await dialog.getByRole('searchbox', { name: 'Plant type' }).fill('monst');
  await dialog.getByRole('option').getByRole('button', { name: /Monstera/ }).click();
  await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('Monstera');
  await dialog.getByLabel('Pot diameter (cm)').fill('24');
  await dialog.getByRole('button', { name: 'Add plant' }).click();
  await page.getByRole('button', { name: 'Done' }).click();

  // Watered today on add -> OK. Reload keeps it.
  await page.reload();
  const marker = page.getByRole('button', { name: /^Monstera, ok, tap to water/ });
  await expect(marker).toBeVisible();

  await page.getByRole('button', { name: /calendar/i }).click();
  const cal = page.getByRole('dialog', { name: 'Watering reminders' });
  const downloadPromise = page.waitForEvent('download');
  await cal.getByRole('button', { name: /download calendar file/i }).click();
  const dl = await downloadPromise;
  expect(dl.suggestedFilename()).toBe('plant-watering.ics');
  await expect(cal.getByRole('button', { name: /copy outlook link/i })).toHaveCount(1);
  await cal.getByRole('button', { name: 'Close' }).click();

  await marker.click();
  await expect(page.getByText('Monstera was just watered')).toBeVisible(); // added < 60 s ago
});
