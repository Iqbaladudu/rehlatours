import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function validateUmrahFormData(formData: any) {
  const errors: string[] = []

  // Required field validation
  const requiredFields = [
    'name',
    'register_date',
    'gender',
    'place_of_birth',
    'birth_date',
    'father_name',
    'mother_name',
    'address',
    'city',
    'province',
    'postal_code',
    'occupation',
    'nik_number',
    'passport_number',
    'date_of_issue',
    'expiry_date',
    'place_of_issue',
    'phone_number',
    'whatsapp_number',
    'email',
    'emergency_contact_name',
    'relationship',
    'emergency_contact_phone',
    'mariage_status',
    'umrah_package',
    'payment_method',
  ]

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${field.replace('_', ' ')} is required`)
    }
  })

  // Terms validation
  if (!formData.terms_of_service) {
    errors.push('You must accept the terms and conditions')
  }

  // NIK validation
  if (formData.nik_number && !/^\d{16}$/.test(formData.nik_number)) {
    errors.push('NIK must be 16 digits')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.push('Invalid email format')
  }

  // Phone validation
  if (formData.phone_number && !/^(\+62|62|0)[8-9][0-9]{7,11}$/.test(formData.phone_number)) {
    errors.push('Invalid phone number format')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
