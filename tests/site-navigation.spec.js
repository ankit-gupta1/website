const { test, expect } = require('@playwright/test');

test.describe('Website behavior', () => {
  const navTargets = [
    { label: 'About', id: 'about' },
    { label: 'Impact', id: 'impact' },
    { label: 'Experience', id: 'experience' },
    { label: 'Operating Model', id: 'operating' },
    { label: 'Education', id: 'education' },
    { label: 'Contact', id: 'contact' },
  ];

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

  test('all navigation tabs work across sections', async ({ page }) => {
    await page.goto('/');

    for (const item of navTargets) {
      await page.getByRole('link', { name: item.label }).click();
      await page.waitForTimeout(120);

      const state = await page.evaluate(({ id }) => {
        const header = document.querySelector('.topbar').getBoundingClientRect();
        const section = document.getElementById(id);
        const heading = section.querySelector('h1, h2, h3').getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        return {
          hash: window.location.hash,
          headingVisible: heading.top >= header.bottom - 1 && heading.top <= viewportHeight - 8,
        };
      }, item);

      expect(state.hash).toBe(`#${item.id}`);
      expect(state.headingVisible).toBe(true);
    }
  });

  test('mobile layout keeps hero and body text compact/readable', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile-only assertion');
    await page.goto('/');

    const state = await page.evaluate(() => {
      const heroTitle = document.querySelector('#about h1');
      const firstBodyLine = document.querySelector('#about .subtitle');
      const firstFact = document.querySelector('#about .command-line p');
      const navLink = document.querySelector('.topbar nav a');

      return {
        heroFontPx: parseFloat(getComputedStyle(heroTitle).fontSize),
        subtitleAlign: getComputedStyle(firstBodyLine).textAlign,
        factAlign: getComputedStyle(firstFact).textAlign,
        navFontPx: parseFloat(getComputedStyle(navLink).fontSize),
      };
    });

    expect(state.heroFontPx).toBeLessThan(36);
    expect(state.subtitleAlign).toBe('left');
    expect(state.factAlign).toBe('left');
    expect(state.navFontPx).toBeLessThan(15);
  });
});
