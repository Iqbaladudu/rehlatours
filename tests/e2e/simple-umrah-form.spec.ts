import { test, expect } from '@playwright/test';

test.describe('Simple Umrah Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading to complete
    try {
      await page.waitForSelector('text=Memuat Data...', { state: 'hidden', timeout: 30000 });
    } catch (e) {
      // If loading text not found, continue anyway
    }
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 30000 });
  });

  test('should load the form with all sections', async ({ page }) => {
    await expect(page.locator('h3:has-text("Informasi Pribadi")')).toBeVisible();
    await expect(page.locator('h3:has-text("Informasi Kontak")')).toBeVisible();
    await expect(page.locator('h3:has-text("Informasi Paspor")')).toBeVisible();
    await expect(page.locator('h3:has-text("Pilihan Paket")')).toBeVisible();
    await expect(page.locator('h3:has-text("Informasi Kesehatan")')).toBeVisible();
    await expect(page.locator('h3:has-text("Pengalaman Ibadah")')).toBeVisible();
    await expect(page.locator('h3:has-text("Syarat dan Ketentuan")')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Wait for validation messages to appear
    await page.waitForTimeout(1000);
    
    // Check that error messages are present
    const errorMessages = await page.locator('text=/wajib|harus|required/i').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should fill personal information section', async ({ page }) => {
    await page.fill('input[name="name"]', 'Ahmad Sulaiman');
    await page.fill('input[name="nik_number"]', '1234567890123456');
    await page.fill('input[name="place_of_birth"]', 'Jakarta');
    
    // Fill birth date using calendar
    await page.click('button:has-text("Pilih tanggal lahir")');
    await page.waitForSelector('.calendar-popup', { timeout: 5000 });
    await page.click('.calendar-popup button:visible');
    
    await page.fill('input[name="father_name"]', 'Bapak Ahmad');
    await page.fill('input[name="mother_name"]', 'Ibu Ahmad');
    
    // Select gender
    await page.click('select[name="gender"]');
    await page.click('text=Laki-laki');
    
    // Select marriage status
    await page.click('select[name="mariage_status"]');
    await page.click('text=Menikah');
    
    await page.fill('input[name="occupation"]', 'Pegawai Swasta');
    
    // Verify the values were filled
    await expect(page.locator('input[name="name"]')).toHaveValue('Ahmad Sulaiman');
    await expect(page.locator('input[name="nik_number"]')).toHaveValue('1234567890123456');
  });

  test('should handle health information checkboxes', async ({ page }) => {
    // Check initial state
    await expect(page.locator('textarea[name="illness"]')).not.toBeVisible();
    
    // Click the specific disease checkbox
    await page.click('#specific_disease');
    
    // Wait for the textarea to appear
    await page.waitForSelector('textarea[name="illness"]', { timeout: 5000 });
    
    // Verify the textarea is now visible
    await expect(page.locator('textarea[name="illness"]')).toBeVisible();
    
    // Fill the illness field
    await page.fill('textarea[name="illness"]', 'Diabetes');
    
    // Check other health checkboxes
    await page.click('#special_needs');
    await page.click('#wheelchair');
    
    // Verify checkboxes are checked
    await expect(page.locator('input[id="special_needs"]')).toBeChecked();
    await expect(page.locator('input[id="wheelchair"]')).toBeChecked();
  });

  test('should hide illness field when specific disease checkbox is unchecked', async ({ page }) => {
    // First check the checkbox to show the field
    await page.click('#specific_disease');
    await page.waitForSelector('textarea[name="illness"]', { timeout: 5000 });
    await expect(page.locator('textarea[name="illness"]')).toBeVisible();
    
    // Then uncheck it
    await page.click('#specific_disease');
    
    // Wait for the textarea to disappear
    await page.waitForSelector('textarea[name="illness"]', { state: 'hidden', timeout: 5000 });
    await expect(page.locator('textarea[name="illness"]')).not.toBeVisible();
  });

  test('should validate NIK format (16 digits)', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="nik_number"]', '123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Check for NIK validation error
    const nikError = await page.locator('text=/NIK.*16.*digit/i').count();
    expect(nikError).toBeGreaterThan(0);
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Check for email validation error
    const emailError = await page.locator('text=/email.*valid/i').count();
    expect(emailError).toBeGreaterThan(0);
  });
});