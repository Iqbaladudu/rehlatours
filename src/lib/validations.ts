import { z } from 'zod'

// Custom validation functions
const indonesianPhoneRegex = /^(\+62|62|0)[8-9][0-9]{7,12}$/
const nikRegex = /^\d{16}$/
const passportRegex = /^[A-Z0-9]{6,15}$/
const nameRegex = /^[a-zA-Z\s\.,'-]+$/

// Helper function to calculate age
const getAge = (birthDate: Date): number => {
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
}

// Helper function to validate passport expiry (minimum 6 months from now)
const validatePassportExpiry = (expiryDate: Date): boolean => {
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
  return expiryDate > sixMonthsFromNow
}

// Zod schema for Umrah Form validation
export const umrahFormSchema = z.object({
  // Personal Information
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(
      nameRegex,
      'Nama hanya boleh mengandung huruf, spasi, titik, koma, apostrof, dan tanda hubung',
    )
    .refine((val) => val.trim().split(' ').length >= 2, {
      message: 'Nama harus terdiri dari minimal 2 kata',
    })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  register_date: z.date().refine(
    (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    },
    {
      message: 'Tanggal pendaftaran tidak boleh di masa lalu',
    },
  ),

  gender: z.enum(['male', 'female'], {
    message: 'Jenis kelamin wajib dipilih',
  }),

  place_of_birth: z
    .string()
    .min(2, 'Tempat lahir minimal 2 karakter')
    .max(50, 'Tempat lahir maksimal 50 karakter')
    .regex(/^[a-zA-Z\s\.,'-]+$/, 'Tempat lahir hanya boleh mengandung huruf dan tanda baca umum')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  birth_date: z.date().refine(
    (date) => {
      const today = new Date()
      return date < today
    },
    {
      message: 'Tanggal lahir tidak boleh di masa depan',
    },
  ),

  father_name: z
    .string()
    .min(3, 'Nama ayah minimal 3 karakter')
    .max(100, 'Nama ayah maksimal 100 karakter')
    .regex(nameRegex, 'Nama ayah hanya boleh mengandung huruf dan tanda baca umum')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  mother_name: z
    .string()
    .min(3, 'Nama ibu minimal 3 karakter')
    .max(100, 'Nama ibu maksimal 100 karakter')
    .regex(nameRegex, 'Nama ibu hanya boleh mengandung huruf dan tanda baca umum')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  // Address Information
  address: z
    .string()
    .min(10, 'Alamat lengkap minimal 10 karakter')
    .max(300, 'Alamat maksimal 300 karakter')
    .refine((val) => val.trim().split(' ').length >= 3, {
      message: 'Alamat harus lebih detail dan jelas',
    })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  city: z
    .string()
    .min(2, 'Kota minimal 2 karakter')
    .max(50, 'Kota maksimal 50 karakter')
    .regex(/^[a-zA-Z\s\.,'-]+$/, 'Nama kota tidak valid')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  province: z
    .string()
    .min(2, 'Provinsi minimal 2 karakter')
    .max(50, 'Provinsi maksimal 50 karakter')
    .regex(/^[a-zA-Z\s\.,'-]+$/, 'Nama provinsi tidak valid')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  postal_code: z
    .string()
    .min(5, 'Kode pos minimal 5 digit')
    .max(6, 'Kode pos maksimal 6 digit')
    .regex(/^\d{5,6}$/, 'Kode pos harus terdiri dari 5-6 digit angka')
    .transform((val) => val.trim()),

  occupation: z
    .string()
    .min(2, 'Pekerjaan minimal 2 karakter')
    .max(100, 'Pekerjaan maksimal 100 karakter')
    .refine((val) => val.trim() !== '', {
      message: 'Pekerjaan tidak boleh kosong',
    })
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  // Health Information
  specific_disease: z.boolean().default(false),

  illness: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),

  special_needs: z.boolean().default(false),

  wheelchair: z.boolean().default(false),

  // Document Information
  nik_number: z
    .string()
    .regex(nikRegex, 'NIK harus terdiri dari 16 digit angka')
    .transform((val) => val.trim()),

  passport_number: z
    .string()
    .min(6, 'Nomor paspor minimal 6 karakter')
    .max(15, 'Nomor paspor maksimal 15 karakter')
    .regex(passportRegex, 'Nomor paspor hanya boleh mengandung huruf kapital dan angka')
    .transform((val) => val.toUpperCase().trim()),

  date_of_issue: z.date().refine(
    (date) => {
      const today = new Date()
      return date <= today
    },
    {
      message: 'Tanggal terbit paspor tidak boleh di masa depan',
    },
  ),

  expiry_date: z.date(),

  place_of_issue: z
    .string()
    .min(2, 'Tempat terbit paspor minimal 2 karakter')
    .max(50, 'Tempat terbit paspor maksimal 50 karakter')
    .regex(/^[a-zA-Z\s\.,'-]+$/, 'Tempat terbit paspor tidak valid')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  // Contact Information
  phone_number: z
    .string()
    .regex(
      indonesianPhoneRegex,
      'Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)',
    )
    .transform((val) => val.trim().replace(/\s/g, '')),

  whatsapp_number: z
    .string()
    .regex(
      indonesianPhoneRegex,
      'Format nomor WhatsApp tidak valid (contoh: 08123456789 atau +628123456789)',
    )
    .transform((val) => val.trim().replace(/\s/g, '')),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .transform((val) => val.toLowerCase().trim()),

  // Pilgrimage History
  has_performed_umrah: z.boolean().default(false),

  has_performed_hajj: z.boolean().default(false),

  // Emergency Contact
  emergency_contact_name: z
    .string()
    .min(3, 'Nama kontak darurat minimal 3 karakter')
    .max(100, 'Nama kontak darurat maksimal 100 karakter')
    .regex(nameRegex, 'Nama kontak darurat hanya boleh mengandung huruf dan tanda baca umum')
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  relationship: z.enum(['parents', 'spouse', 'children', 'sibling', 'relative'], {
    message: 'Hubungan dengan kontak darurat wajib dipilih',
  }),

  emergency_contact_phone: z
    .string()
    .regex(indonesianPhoneRegex, 'Format nomor telepon kontak darurat tidak valid')
    .transform((val) => val.trim().replace(/\s/g, '')),

  // Package Information
  mariage_status: z.enum(['single', 'married', 'divorced'], {
    message: 'Status pernikahan wajib dipilih',
  }),

  umrah_package: z
    .string()
    .min(1, 'Paket umroh harus dipilih')
    .transform((val) => val.trim()),

  payment_method: z.enum(['lunas', '60_percent'], {
    message: 'Metode pembayaran wajib dipilih',
  }),

  // Terms
  terms_of_service: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui syarat dan ketentuan',
  }),
})

// Type inference for the schema
export type UmrahFormData = z.infer<typeof umrahFormSchema>

// Helper function to validate form data
export function validateUmrahForm(formData: any) {
  console.log('=== VALIDATION START ===')
  console.log('Validation input:', formData)
  console.log('Validation input type:', typeof formData)
  console.log('Validation input keys:', formData ? Object.keys(formData) : 'null/undefined')

  try {
    console.log('Step V1: Starting umrahFormSchema.parse...')

    // Simple validation without complex transformations
    const validatedData = umrahFormSchema.parse(formData)

    console.log('Step V2: umrahFormSchema.parse completed successfully')
    console.log('Validated data:', validatedData)
    console.log('=== VALIDATION SUCCESS ===')

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    console.log('=== VALIDATION ERROR ===')
    console.error('Validation error type:', typeof error)
    console.error('Validation error constructor:', error?.constructor?.name)
    console.error(
      'Validation error message:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    console.error('Full validation error:', error)

    if (error instanceof Error && error.stack) {
      console.error('Validation error stack:')
      console.error(error.stack)
    }

    if (error instanceof Error && error.message.includes('Maximum call stack')) {
      console.log('DETECTED: Stack overflow in validation!')
    }

    if (error instanceof z.ZodError) {
      console.log('ZodError issues:', error.issues)
      const errorMessages = error.issues.map((err: any) => err.message)
      return {
        success: false,
        errors: errorMessages,
        error: errorMessages.join(', '),
      }
    }

    return {
      success: false,
      error: 'Validasi gagal: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }
  }
}

// Helper function to get validation errors for specific fields
export function getFieldErrors(formData: any) {
  try {
    umrahFormSchema.parse(formData)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      return fieldErrors
    }
    return {}
  }
}
