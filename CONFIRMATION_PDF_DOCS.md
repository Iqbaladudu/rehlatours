# Konfirmasi PDF - Dokumentasi

## Overview

Template `ConfirmationPDF` telah diperbaiki dan dioptimalkan untuk menangani data form Umrah dengan aman. Komponen ini mendukung:

- Data lengkap dari form Umrah
- Backward compatibility dengan format data lama
- Error handling yang robust
- Font fallback untuk reliabilitas
- Validasi data otomatis

## Fitur Utama

### 1. **Safe Data Access**
- Menggunakan helper function `safeGet()` untuk mengakses data dengan aman
- Fallback value untuk data yang kosong atau undefined
- Validasi otomatis untuk mencegah error

### 2. **Format Data Baru (UmrahFormData)**
```typescript
interface UmrahFormData {
  // Personal Information
  name: string
  gender: 'male' | 'female'
  place_of_birth: string
  birth_date: string
  father_name: string
  mother_name: string
  
  // Contact Information
  email: string
  phone_number: string
  whatsapp_number: string
  
  // ... dan field lainnya
}
```

### 3. **Backward Compatibility**
Mendukung format data lama dengan konversi otomatis:
```typescript
interface LegacyBookingData {
  bookingId: string
  customerName: string
  email: string
  whatsappNumber: string
  phoneNumber: string
  packageName: string
  paymentMethod: string
}
```

## Cara Penggunaan

### 1. **Format Baru (Recommended)**

```typescript
import ConfirmationPDF from '@/components/ConfirmationPDF'
import { generateBookingId, createDefaultUmrahFormData } from '@/lib/pdf-utils'

const umrahData = createDefaultUmrahFormData({
  name: 'Ahmad Abdullah',
  email: 'ahmad@email.com',
  phone_number: '+6281234567890',
  umrah_package: 'Paket Premium 14 Hari',
  payment_method: 'lunas'
})

const bookingId = generateBookingId()

// Untuk rendering PDF
<ConfirmationPDF formData={umrahData} bookingId={bookingId} />
```

### 2. **Mengirim via WhatsApp API**

```typescript
import { sendConfirmationPDF } from '@/lib/pdf-utils'

const result = await sendConfirmationPDF(
  '6289685028129@s.whatsapp.net',
  umrahData,
  bookingId,
  {
    caption: 'Konfirmasi pemesanan Umrah Anda',
    is_forwarded: false,
    duration: 3600
  }
)

if (result.success) {
  console.log('PDF berhasil dikirim!')
} else {
  console.error('Error:', result.error)
}
```

### 3. **Menggunakan API Endpoint**

#### POST `/api/send-file`

**Format Baru:**
```typescript
const formData = new FormData()
formData.append('phone', '6289685028129@s.whatsapp.net')
formData.append('umrahFormData', JSON.stringify(umrahData))
formData.append('bookingId', bookingId)
formData.append('caption', 'Konfirmasi pemesanan Anda')

fetch('/api/send-file', {
  method: 'POST',
  body: formData
})
```

**Format Lama (Backward Compatibility):**
```typescript
const formData = new FormData()
formData.append('phone', '6289685028129@s.whatsapp.net')
formData.append('bookingData', JSON.stringify({
  bookingId: 'RT-1234-567890',
  customerName: 'Ahmad Abdullah',
  email: 'ahmad@email.com',
  phoneNumber: '+6281234567890',
  whatsappNumber: '+6281234567890',
  packageName: 'Paket Premium',
  paymentMethod: 'Lunas'
}))

fetch('/api/send-file', {
  method: 'POST',
  body: formData
})
```

## Troubleshooting

### Error: "Cannot read properties of undefined"

**Penyebab:** Data yang dikirim tidak lengkap atau undefined

**Solusi:**
1. Pastikan menggunakan format data yang benar
2. Gunakan helper function `createDefaultUmrahFormData()` untuk mengisi field yang kosong
3. Validasi data sebelum mengirim dengan `validateUmrahDataForPDF()`

```typescript
import { validateUmrahDataForPDF, createDefaultUmrahFormData } from '@/lib/pdf-utils'

// Validasi data
const validation = validateUmrahDataForPDF(rawData)
if (!validation.isValid) {
  console.error('Missing fields:', validation.missingFields)
  return
}

// Atau gunakan default values
const safeData = createDefaultUmrahFormData(rawData)
```

### Error Font Loading

**Penyebab:** Custom font gagal dimuat

**Solusi:** Komponen otomatis fallback ke Helvetica jika custom font gagal dimuat.

### PDF Generation Error

**Penyebab:** Data tidak sesuai dengan interface yang diharapkan

**Solusi:**
1. Periksa format data yang dikirim
2. Gunakan TypeScript untuk type checking
3. Gunakan helper functions untuk konversi data

## Testing

### 1. **Test Manual**
Akses `/test-pdf` untuk test interaktif

### 2. **Test API**
```bash
# Test dengan curl
curl -X POST http://localhost:3000/api/test-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "formData": { ... },
    "bookingId": "RT-TEST-123"
  }'
```

### 3. **Test Component**
```typescript
import { render } from '@testing-library/react'
import ConfirmationPDF from '@/components/ConfirmationPDF'
import { createDefaultUmrahFormData } from '@/lib/pdf-utils'

const testData = createDefaultUmrahFormData({
  name: 'Test User',
  email: 'test@email.com'
})

render(<ConfirmationPDF formData={testData} bookingId="TEST-123" />)
```

## Best Practices

1. **Selalu gunakan helper functions** untuk data handling
2. **Validasi data** sebelum generate PDF
3. **Handle errors** dengan graceful fallback
4. **Test dengan data yang tidak lengkap** untuk memastikan robust
5. **Gunakan TypeScript** untuk type safety

## Changelog

### v2.0.0 (Current)
- ✅ Fixed undefined data access errors
- ✅ Added safe data handling with `safeGet()`
- ✅ Improved font loading with fallbacks
- ✅ Added backward compatibility
- ✅ Enhanced error handling
- ✅ Added utility functions
- ✅ Improved documentation

### v1.0.0 (Legacy)
- ❌ Basic PDF template
- ❌ Limited error handling
- ❌ Font loading issues
- ❌ No data validation
