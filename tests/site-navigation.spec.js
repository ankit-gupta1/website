const { test, expect } = require('@playwright/test');

test.describe('Website behavior', () => {
  test('top navigation remains accessible while scrolling', async ({ page }) => {
    await page.goto('/');

    const topbar = page.locator('.topbar');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(topbar).toBeVisible();
    const box = await topbar.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y).toBeLessThanOrEqual(1);
  });

  test('impact nav lands with heading visible and section highlight active', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Impact' }).click();

    const pingAppeared = await page
      .waitForFunction(
        () => document.getElementById('impact')?.classList.contains('section-ping') === true,
        { timeout: 1800 }
      )
      .then(() => true)
      .catch(() => false);

    const state = await page.evaluate(() => {
      const header = document.querySelector('.topbar').getBoundingClientRect();
      const section = document.getElementById('impact');
      const heading = section.querySelector('h2').getBoundingClientRect();
      const style = getComputedStyle(section);

      return {
        headingVisible: heading.top >= header.bottom + 4,
        borderColor: style.borderColor,
      };
    });

    expect(state.headingVisible).toBe(true);
    expect(pingAppeared || state.borderColor !== 'rgb(214, 207, 190)').toBe(true);
  });

  test('about nav lands with heading visible and key content is correct', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();

    const state = await page.evaluate(() => {
      const header = document.querySelector('.topbar').getBoundingClientRect();
      const section = document.getElementById('about');
      const heading = section.querySelector('h1').getBoundingClientRect();

      return {
        headingVisible: heading.top >= header.bottom + 4,
        noImageTag: document.querySelectorAll('img').length === 0,
        hasContactLine: document.body.textContent.includes(
          'Open to technical leadership opportunities in cloud infrastructure and platform architecture.'
        ),
      };
    });

    expect(state.headingVisible).toBe(true);
    expect(state.noImageTag).toBe(true);
    expect(state.hasContactLine).toBe(true);
  });
});
