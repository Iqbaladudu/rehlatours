import { test, expect } from '@playwright/test';

test.describe('Debug Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('wait for page to fully load', async ({ page }) => {
    console.log('Page URL:', page.url());
    
    // Wait for either form to appear or loading text to disappear
    try {
      await Promise.race([
        page.waitForSelector('form', { timeout: 30000 }),
        page.waitForSelector('text=Memuat Data...', { timeout: 5000 })
      ]);
    } catch (e) {
      console.log('Timeout waiting for initial elements');
    }
    
    // Wait for loading to complete if it exists
    try {
      await page.waitForSelector('text=Memuat Data...', { state: 'hidden', timeout: 30000 });
      console.log('Loading text disappeared');
    } catch (e) {
      console.log('Loading text not found or timeout');
    }
    
    // Take screenshot after waiting
    await page.screenshot({ path: 'debug-page-after-wait.png', fullPage: true });
    
    const bodyContent = await page.locator('body').textContent();
    console.log('Body content preview:', bodyContent?.substring(0, 500));
    
    const formElements = await page.locator('form').count();
    console.log('Forms found after wait:', formElements);
    
    const h1Elements = await page.locator('h1').count();
    console.log('H1 elements found:', h1Elements);
    
    if (h1Elements > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log('First H1 text:', h1Text);
    }
    
    const inputElements = await page.locator('input').count();
    console.log('Input elements found:', inputElements);
    
    const buttonElements = await page.locator('button').count();
    console.log('Button elements found:', buttonElements);
    
    // Check for umrah-related text
    const umrahTexts = await page.locator('text=Umrah').all();
    console.log('Umrah text elements found:', umrahTexts.length);
    
    for (let i = 0; i < Math.min(umrahTexts.length, 3); i++) {
      const text = await umrahTexts[i].textContent();
      console.log(`Umrah text ${i + 1}:`, text);
    }
  });
  
  test('check page source for debugging', async ({ page }) => {
    // Wait a bit for page to stabilize
    await page.waitForTimeout(5000);
    
    const htmlContent = await page.content();
    console.log('HTML content length:', htmlContent.length);
    
    // Check for specific keywords in the HTML
    const keywords = ['form', 'input', 'button', 'umrah', 'pendaftaran'];
    for (const keyword of keywords) {
      const count = (htmlContent.match(new RegExp(keyword, 'gi')) || []).length;
      console.log(`Keyword "${keyword}" found ${count} times`);
    }
    
    await page.screenshot({ path: 'debug-final.png', fullPage: true });
  });
});