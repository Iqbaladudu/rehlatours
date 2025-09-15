import { z } from 'zod'

// Ultra-simple validation schema without any .refine() calls or complex transformations
export const umrahFormSchemaSimple = z.object({
  // Personal Information
  name: z.string().min(1, 'Nama wajib diisi'),
  register_date: z.date(),
  gender: z.enum(['male', 'female']),
  place_of_birth: z.string().min(1, 'Tempat lahir wajib diisi'),
  birth_date: z.date(),
  father_name: z.string().min(1, 'Nama ayah wajib diisi'),
  mother_name: z.string().min(1, 'Nama ibu wajib diisi'),

  // Address Information
  address: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  postal_code: z.string().min(1, 'Kode pos wajib diisi'),
  occupation: z.string().min(1, 'Pekerjaan wajib diisi'),

  // Health Information
  specific_disease: z.boolean().default(false),
  illness: z.string().optional(),
  special_needs: z.boolean().default(false),
  wheelchair: z.boolean().default(false),

  // Document Information
  nik_number: z.string().min(1, 'NIK wajib diisi'),
  passport_number: z.string().min(1, 'Nomor paspor wajib diisi'),
  date_of_issue: z.date(),
  expiry_date: z.date(),
  place_of_issue: z.string().min(1, 'Tempat terbit paspor wajib diisi'),

  // Contact Information
  phone_number: z.string().min(1, 'Nomor telepon wajib diisi'),
  whatsapp_number: z.string().min(1, 'Nomor WhatsApp wajib diisi'),
  email: z.string().email('Format email tidak valid'),

  // Pilgrimage History
  has_performed_umrah: z.boolean().default(false),
  has_performed_hajj: z.boolean().default(false),

  // Emergency Contact
  emergency_contact_name: z.string().min(1, 'Nama kontak darurat wajib diisi'),
  relationship: z.enum(['parents', 'spouse', 'children', 'sibling', 'relative']),
  emergency_contact_phone: z.string().min(1, 'Nomor telepon kontak darurat wajib diisi'),

  // Package Information
  mariage_status: z.enum(['single', 'married', 'divorced']),
  umrah_package: z.string().min(1, 'Paket umroh harus dipilih'),
  payment_method: z.enum(['lunas', '60_percent']),

  // Terms
  terms_of_service: z.boolean(),
})

// Type inference for the simple schema
export type UmrahFormDataSimple = z.infer<typeof umrahFormSchemaSimple>

// Helper function to validate form data with simple schema
export function validateUmrahFormSimple(formData: any) {
  console.log('=== SIMPLE VALIDATION START ===')
  console.log('Simple validation input:', formData)

  try {
    console.log('Step S1: Starting umrahFormSchemaSimple.parse...')

    const validatedData = umrahFormSchemaSimple.parse(formData)

    console.log('Step S2: umrahFormSchemaSimple.parse completed successfully')
    console.log('Simple validated data keys:', Object.keys(validatedData))
    console.log('=== SIMPLE VALIDATION SUCCESS ===')

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    console.log('=== SIMPLE VALIDATION ERROR ===')
    console.error('Simple validation error:', error)

    if (error instanceof Error && error.message.includes('Maximum call stack')) {
      console.log('DETECTED: Stack overflow in SIMPLE validation!')
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: any) => err.message)
      return {
        success: false,
        errors: errorMessages,
        error: errorMessages.join(', '),
      }
    }

    return {
      success: false,
      error: 'Simple validasi gagal: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }
  }
}
