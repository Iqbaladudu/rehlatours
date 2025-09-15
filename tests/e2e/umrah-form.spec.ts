import { test, expect } from '@playwright/test';

test.describe('Umrah Form Tests', () => {
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
    await expect(page.locator('text=Informasi Pribadi')).toBeVisible();
    await expect(page.locator('text=Informasi Kontak')).toBeVisible();
    await expect(page.locator('text=Informasi Paspor')).toBeVisible();
    await expect(page.locator('text=Pilihan Paket')).toBeVisible();
    await expect(page.locator('text=Informasi Kesehatan')).toBeVisible();
    await expect(page.locator('text=Pengalaman Ibadah')).toBeVisible();
    await expect(page.locator('text=Syarat dan Ketentuan')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Wait for validation messages to appear
    await page.waitForTimeout(1000);
    
    // Check for validation errors using more specific selectors
    await expect(page.locator('form')).toBeVisible();
    
    // Check that error messages are present (using the error message pattern)
    const errorMessages = await page.locator('text=/wajib|harus|required/i').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should fill personal information section', async ({ page }) => {
    await page.fill('input[name="name"]', 'Ahmad Sulaiman');
    await page.fill('input[name="nik_number"]', '1234567890123456');
    await page.fill('input[name="place_of_birth"]', 'Jakarta');
    
    await page.click('button:has-text("Pilih tanggal lahir")');
    await page.click('button[aria-selected="false"]:visible');
    
    await page.fill('input[name="father_name"]', 'Bapak Ahmad');
    await page.fill('input[name="mother_name"]', 'Ibu Ahmad');
    
    await page.click('select[name="gender"]');
    await page.click('text=Laki-laki');
    
    await page.click('select[name="mariage_status"]');
    await page.click('text=Menikah');
    
    await page.fill('input[name="occupation"]', 'Pegawai Swasta');
  });

  test('should fill contact information section', async ({ page }) => {
    await page.fill('input[name="phone_number"]', '08123456789');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="address"]', 'Jl. Test No. 123');
    await page.fill('input[name="city"]', 'Jakarta');
    await page.fill('input[name="province"]', 'DKI Jakarta');
    await page.fill('input[name="postal_code"]', '12345');
    await page.fill('input[name="whatsapp_number"]', '08123456789');
    await page.fill('input[name="emergency_contact_name"]', 'Kontak Darurat');
    await page.click('select[name="relationship"]');
    await page.click('text=Orang Tua');
    await page.fill('input[name="emergency_contact_phone"]', '08123456789');
  });

  test('should fill passport information section', async ({ page }) => {
    await page.fill('input[name="passport_number"]', 'A1234567');
    
    await page.click('button:has-text("Pilih tanggal")');
    await page.click('button[aria-selected="false"]:visible');
    
    await page.click('button:has-text("Pilih tanggal") >> nth=1');
    await page.click('button[aria-selected="false"]:visible');
    
    await page.fill('input[name="place_of_issue"]', 'Jakarta');
  });

  test('should fill package selection section', async ({ page }) => {
    await page.click('select[name="umrah_package"]');
    await page.click('text=Pilih paket umrah');
    
    await page.click('select[name="payment_method"]');
    await page.click('text=Lunas');
    
    await page.click('button:has-text("Pilih tanggal")');
    await page.click('button[aria-selected="false"]:visible');
  });

  test('should handle health information checkboxes', async ({ page }) => {
    await page.click('input[type="checkbox"][id="specific_disease"]');
    await expect(page.locator('textarea[name="illness"]')).toBeVisible();
    await page.fill('textarea[name="illness"]', 'Diabetes');
    
    await page.click('input[type="checkbox"][id="special_needs"]');
    await page.click('input[type="checkbox"][id="wheelchair"]');
    
    await expect(page.locator('input[id="special_needs"]')).toBeChecked();
    await expect(page.locator('input[id="wheelchair"]')).toBeChecked();
  });

  test('should handle religious experience checkboxes', async ({ page }) => {
    await page.click('input[type="checkbox"][id="has_performed_umrah"]');
    await page.click('input[type="checkbox"][id="has_performed_hajj"]');
    
    await expect(page.locator('input[id="has_performed_umrah"]')).toBeChecked();
    await expect(page.locator('input[id="has_performed_hajj"]')).toBeChecked();
  });

  test('should require terms and conditions acceptance', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="nik_number"]', '1234567890123456');
    await page.fill('input[name="place_of_birth"]', 'Jakarta');
    await page.fill('input[name="father_name"]', 'Father');
    await page.fill('input[name="mother_name"]', 'Mother');
    await page.fill('input[name="occupation"]', 'Test');
    await page.fill('input[name="phone_number"]', '08123456789');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="address"]', 'Test Address');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="province"]', 'Test Province');
    await page.fill('input[name="postal_code"]', '12345');
    await page.fill('input[name="whatsapp_number"]', '08123456789');
    await page.fill('input[name="emergency_contact_name"]', 'Emergency');
    await page.fill('input[name="emergency_contact_phone"]', '08123456789');
    await page.fill('input[name="passport_number"]', 'A1234567');
    await page.fill('input[name="place_of_issue"]', 'Jakarta');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Syarat dan ketentuan harus disetujui')).toBeVisible();
  });

  test('should submit form successfully with all required fields', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="nik_number"]', '1234567890123456');
    await page.fill('input[name="place_of_birth"]', 'Jakarta');
    await page.fill('input[name="father_name"]', 'Father');
    await page.fill('input[name="mother_name"]', 'Mother');
    await page.fill('input[name="occupation"]', 'Test');
    await page.fill('input[name="phone_number"]', '08123456789');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="address"]', 'Test Address');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="province"]', 'Test Province');
    await page.fill('input[name="postal_code"]', '12345');
    await page.fill('input[name="whatsapp_number"]', '08123456789');
    await page.fill('input[name="emergency_contact_name"]', 'Emergency');
    await page.fill('input[name="emergency_contact_phone"]', '08123456789');
    await page.fill('input[name="passport_number"]', 'A1234567');
    await page.fill('input[name="place_of_issue"]', 'Jakarta');
    
    await page.click('select[name="gender"]');
    await page.click('text=Laki-laki');
    
    await page.click('select[name="mariage_status"]');
    await page.click('text=Menikah');
    
    await page.click('select[name="relationship"]');
    await page.click('text=Orang Tua');
    
    await page.click('select[name="umrah_package"]');
    await page.click('text=Pilih paket umrah');
    
    await page.click('select[name="payment_method"]');
    await page.click('text=Lunas');
    
    await page.click('input[type="checkbox"][id="terms_of_service"]');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Mengirim...')).toBeVisible();
  });

  test('should show illness field when specific disease checkbox is checked', async ({ page }) => {
    await expect(page.locator('textarea[name="illness"]')).not.toBeVisible();
    
    await page.click('input[type="checkbox"][id="specific_disease"]');
    
    await expect(page.locator('textarea[name="illness"]')).toBeVisible();
    await expect(page.locator('text=Jenis Penyakit')).toBeVisible();
  });

  test('should hide illness field when specific disease checkbox is unchecked', async ({ page }) => {
    await page.click('input[type="checkbox"][id="specific_disease"]');
    await expect(page.locator('textarea[name="illness"]')).toBeVisible();
    
    await page.click('input[type="checkbox"][id="specific_disease"]');
    await expect(page.locator('textarea[name="illness"]')).not.toBeVisible();
  });

  test('should validate NIK format (16 digits)', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="nik_number"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=NIK harus 16 digit')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email tidak valid')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.fill('input[name="phone_number"]', 'abc');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Nomor telepon tidak valid')).toBeVisible();
  });
});