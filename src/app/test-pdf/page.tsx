'use client'

import React, { useState } from 'react'

export default function TestPDFPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadSamplePDF = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/test-pdf', {
        method: 'GET',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `confirmation-test-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testCustomPDF = async () => {
    try {
      setLoading(true)
      setError(null)

      const customFormData = {
        name: 'Test User Custom',
        register_date: '2024-02-01',
        gender: 'female',
        place_of_birth: 'Bandung',
        birth_date: '1990-05-15',
        father_name: 'Bapak Test',
        mother_name: 'Ibu Test',
        address: 'Jl. Test No. 456',
        city: 'Bandung',
        province: 'Jawa Barat',
        postal_code: '54321',
        occupation: 'Teacher',
        specific_disease: true,
        illness: 'Diabetes',
        special_needs: false,
        wheelchair: false,
        nik_number: '3273015005900002',
        passport_number: 'B9876543',
        date_of_issue: '2023-06-01',
        expiry_date: '2028-06-01',
        place_of_issue: 'Bandung',
        phone_number: '+6285555555555',
        whatsapp_number: '+6285555555555',
        email: 'test.custom@email.com',
        has_performed_umrah: true,
        has_performed_hajj: false,
        emergency_contact_name: 'Emergency Contact',
        relationship: 'parents',
        emergency_contact_phone: '+6286666666666',
        mariage_status: 'single',
        umrah_package: 'Paket Umrah Ekonomi 10 Hari',
        payment_method: '60_percent',
        terms_of_service: true,
      }

      const customBookingId = 'RT-CUSTOM-' + Date.now()

      const response = await fetch('/api/test-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: customFormData,
          bookingId: customBookingId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate custom PDF')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `confirmation-custom-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test Confirmation PDF</h1>

        <div className="space-y-6">
          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Test buttons */}
          <div className="space-y-4">
            <button
              onClick={downloadSamplePDF}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Generating...' : 'Download Sample PDF (Male, Married, Lunas)'}
            </button>

            <button
              onClick={testCustomPDF}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Generating...' : 'Download Custom PDF (Female, Single, Cicilan)'}
            </button>
          </div>

          {/* Information */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Sample PDF:</strong> Contains data for a married male customer with full
                payment
              </p>
              <p>
                <strong>Custom PDF:</strong> Contains data for a single female customer with
                installment payment and health conditions
              </p>
              <p>
                <strong>Features tested:</strong> All form fields, formatting, date display, boolean
                values, conditional fields
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Font:</strong> Helvetica with Inter fallback
              </p>
              <p>
                <strong>Page Size:</strong> A4
              </p>
              <p>
                <strong>Sections:</strong> Personal Info, Contact, Address, Documents, Health,
                Emergency Contact, Package
              </p>
              <p>
                <strong>Conditional Fields:</strong> Illness details (if specific_disease = true)
              </p>
              <p>
                <strong>Formatting:</strong> Indonesian date format, boolean to "Ya/Tidak", enum
                translations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
