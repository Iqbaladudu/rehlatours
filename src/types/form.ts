type FormOption = { label: string; value: string }

type PayloadField =
  | {
      blockType: 'text' | 'email' | 'textarea'
      name: string
      label?: string
      required?: boolean
      width?: number
    }
  | { blockType: 'number'; name: string; label?: string; required?: boolean; width?: number }
  | { blockType: 'checkbox'; name: string; label?: string; required?: boolean; width?: number }
  | { blockType: 'date'; name: string; label?: string; required?: boolean; width?: number }
  | {
      blockType: 'select'
      name: string
      label?: string
      required?: boolean
      width?: number
      options?: FormOption[]
    }

export type PayloadForm = {
  id: string
  title: string
  fields: PayloadField[]
  submitButtonLabel?: string
}

export type UmrahFormData = {
  // Personal Information
  name: string
  register_date: string
  gender: 'male' | 'female'
  place_of_birth: string
  birth_date: string
  father_name: string
  mother_name: string

  // Address Information
  address: string
  city: string
  province: string
  postal_code: string
  occupation: string

  // Health Information
  specific_disease: boolean
  illness?: string
  special_needs: boolean
  wheelchair: boolean

  // Document Information
  nik_number: string
  passport_number: string
  date_of_issue: string
  expiry_date: string
  place_of_issue: string

  // Contact Information
  phone_number: string
  whatsapp_number: string
  email: string

  // Pilgrimage History
  has_performed_umrah: boolean
  has_performed_hajj: boolean

  // Emergency Contact
  emergency_contact_name: string
  relationship: 'parents' | 'spouse' | 'children' | 'sibling' | 'relative'
  emergency_contact_phone: string

  // Package Information
  mariage_status: 'single' | 'married' | 'divorced'
  umrah_package: string
  payment_method: 'lunas' | '60_percent'

  // Terms
  terms_of_service: boolean
}