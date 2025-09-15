'use server'

import { getUmrahPackageOptions, submitUmrahForm } from '@/actions/services'
import { type UmrahFormData } from '@/lib/validations'

export async function handleUmrahFormSubmission(formData: UmrahFormData) {
  console.log('=== FRONTEND ACTION START ===')
  console.log('Action received form data:', formData)
  console.log('Form data type:', typeof formData)
  console.log('Form data keys:', formData ? Object.keys(formData) : 'null/undefined')

  try {
    console.log('Frontend action: About to call submitUmrahForm service...')

    const result = await submitUmrahForm(formData)

    console.log('Frontend action: submitUmrahForm returned:')
    console.log('Result:', result)

    if (result.success) {
      console.log('Form submitted successfully:', result.data?.booking_id)
      console.log('=== FRONTEND ACTION SUCCESS ===')
      return {
        success: true,
        data: result.data,
      }
    } else {
      console.error('Form submission failed:', result.error)
      console.log('=== FRONTEND ACTION FAILED ===')
      return {
        success: false,
        error: result.error,
        errors: result.errors,
      }
    }
  } catch (error) {
    console.log('=== FRONTEND ACTION ERROR ===')
    console.error('Frontend action error type:', typeof error)
    console.error('Frontend action error constructor:', error?.constructor?.name)
    console.error(
      'Frontend action error message:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    console.error('Full frontend action error:', error)

    if (error instanceof Error && error.stack) {
      console.error('Frontend action error stack:')
      console.error(error.stack)
    }

    if (error instanceof Error && error.message.includes('Maximum call stack')) {
      console.log('DETECTED: Stack overflow in frontend action!')
    }

    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.',
    }
  }
}

export async function getPackageOptions() {
  try {
    const result = await getUmrahPackageOptions()

    if (result.success) {
      return {
        success: true,
        data: result.data,
      }
    } else {
      console.error('Failed to fetch packages:', result.error)
      return {
        success: false,
        error: result.error,
        data: [],
      }
    }
  } catch (error) {
    console.error('Error fetching package options:', error)
    return {
      success: false,
      error: 'Gagal mengambil daftar paket umroh',
      data: [],
    }
  }
}
