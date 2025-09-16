import { UmrahFormData } from '@/types/form'

// Helper function to generate a booking ID
export function generateBookingId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `RT-${random}-${timestamp}`
}

// Helper function to create a complete UmrahFormData object with default values
export function createDefaultUmrahFormData(partialData: Partial<UmrahFormData> = {}): UmrahFormData {
  const now = new Date()
  const defaultDate = now.toISOString().split('T')[0]

  return {
    // Personal Information
    name: partialData.name || '',
    register_date: partialData.register_date || defaultDate,
    gender: partialData.gender || 'male',
    place_of_birth: partialData.place_of_birth || '',
    birth_date: partialData.birth_date || '',
    father_name: partialData.father_name || '',
    mother_name: partialData.mother_name || '',

    // Address Information
    address: partialData.address || '',
    city: partialData.city || '',
    province: partialData.province || '',
    postal_code: partialData.postal_code || '',
    occupation: partialData.occupation || '',

    // Health Information
    specific_disease: partialData.specific_disease ?? false,
    illness: partialData.illness || '',
    special_needs: partialData.special_needs ?? false,
    wheelchair: partialData.wheelchair ?? false,

    // Document Information
    nik_number: partialData.nik_number || '',
    passport_number: partialData.passport_number || '',
    date_of_issue: partialData.date_of_issue || '',
    expiry_date: partialData.expiry_date || '',
    place_of_issue: partialData.place_of_issue || '',

    // Contact Information
    phone_number: partialData.phone_number || '',
    whatsapp_number: partialData.whatsapp_number || '',
    email: partialData.email || '',

    // Pilgrimage History
    has_performed_umrah: partialData.has_performed_umrah ?? false,
    has_performed_hajj: partialData.has_performed_hajj ?? false,

    // Emergency Contact
    emergency_contact_name: partialData.emergency_contact_name || '',
    relationship: partialData.relationship || 'parents',
    emergency_contact_phone: partialData.emergency_contact_phone || '',

    // Package Information
    mariage_status: partialData.mariage_status || 'single',
    umrah_package: partialData.umrah_package || '',
    payment_method: partialData.payment_method || 'lunas',

    // Terms
    terms_of_service: partialData.terms_of_service ?? true,
  }
}

// Helper function to validate required fields for PDF generation
export function validateUmrahDataForPDF(data: Partial<UmrahFormData>): { isValid: boolean; missingFields: string[] } {
  const requiredFields: (keyof UmrahFormData)[] = [
    'name',
    'email',
    'phone_number',
    'umrah_package',
    'payment_method'
  ]

  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      missingFields.push(field)
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

// Helper function to convert legacy booking data format to UmrahFormData
export interface LegacyBookingData {
  bookingId: string
  customerName: string
  email: string
  whatsappNumber: string
  phoneNumber: string
  packageName: string
  paymentMethod: string
}

export function convertLegacyBookingData(legacyData: LegacyBookingData): UmrahFormData {
  return createDefaultUmrahFormData({
    name: legacyData.customerName,
    email: legacyData.email,
    phone_number: legacyData.phoneNumber,
    whatsapp_number: legacyData.whatsappNumber,
    umrah_package: legacyData.packageName,
    payment_method: legacyData.paymentMethod?.toLowerCase() === 'lunas' ? 'lunas' : '60_percent',
  })
}

// Helper function to send PDF via WhatsApp API
export async function sendConfirmationPDF(
  phone: string,
  umrahFormData: UmrahFormData,
  bookingId: string,
  options: {
    caption?: string
    is_forwarded?: boolean
    duration?: number
  } = {}
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    const formData = new FormData()
    formData.append('phone', phone)
    formData.append('umrahFormData', JSON.stringify(umrahFormData))
    formData.append('bookingId', bookingId)
    
    if (options.caption) {
      formData.append('caption', options.caption)
    }
    
    if (options.is_forwarded !== undefined) {
      formData.append('is_forwarded', options.is_forwarded.toString())
    }
    
    if (options.duration !== undefined) {
      formData.append('duration', options.duration.toString())
    }

    const response = await fetch('/api/send-file', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to send PDF'
      }
    }

    const result = await response.json()
    return {
      success: true,
      response: result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
