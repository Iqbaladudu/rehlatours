'use client'

import React, { useState } from 'react'
import { 
  generateBookingId, 
  createDefaultUmrahFormData, 
  sendConfirmationPDF,
  validateUmrahDataForPDF 
} from '@/lib/pdf-utils'
import { UmrahFormData } from '@/types/form'

export default function PDFExamplePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Example 1: Complete form data
  const handleCompleteDataTest = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const completeData = createDefaultUmrahFormData({
        name: 'Ahmad Abdullah Rahman',
        gender: 'male',
        place_of_birth: 'Jakarta',
        birth_date: '1985-03-20',
        father_name: 'Abdullah Rahman',
        mother_name: 'Siti Aminah',
        address: 'Jl. Sudirman No. 123',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postal_code: '12190',
        occupation: 'Software Engineer',
        email: 'ahmad.abdullah@email.com',
        phone_number: '+6281234567890',
        whatsapp_number: '+6281234567890',
        umrah_package: 'Paket Umrah Premium 14 Hari',
        payment_method: 'lunas',
        mariage_status: 'married',
        emergency_contact_name: 'Fatimah Abdullah',
        relationship: 'spouse',
        emergency_contact_phone: '+6281987654321',
      })

      const bookingId = generateBookingId()
      
      // Validate data
      const validation = validateUmrahDataForPDF(completeData)
      if (!validation.isValid) {
        throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`)
      }

      // Send PDF
      const response = await sendConfirmationPDF(
        '6289685028129@s.whatsapp.net',
        completeData,
        bookingId,
        {
          caption: 'Konfirmasi pemesanan Umrah Anda - Data Lengkap',
          is_forwarded: false,
          duration: 3600
        }
      )

      if (response.success) {
        setResult(`✅ PDF berhasil dikirim! Booking ID: ${bookingId}`)
      } else {
        setError(`❌ Error: ${response.error}`)
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Example 2: Minimal data (should still work)
  const handleMinimalDataTest = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const minimalData = createDefaultUmrahFormData({
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone_number: '+6285555555555',
        umrah_package: 'Paket Umrah Ekonomi',
        payment_method: '60_percent',
      })

      const bookingId = generateBookingId()
      
      // Validate data
      const validation = validateUmrahDataForPDF(minimalData)
      if (!validation.isValid) {
        throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`)
      }

      // Send PDF
      const response = await sendConfirmationPDF(
        '6289685028129@s.whatsapp.net',
        minimalData,
        bookingId,
        {
          caption: 'Konfirmasi pemesanan Umrah Anda - Data Minimal',
        }
      )

      if (response.success) {
        setResult(`✅ PDF berhasil dikirim! Booking ID: ${bookingId}`)
      } else {
        setError(`❌ Error: ${response.error}`)
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Example 3: Legacy format (backward compatibility)
  const handleLegacyDataTest = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const legacyData = {
        bookingId: generateBookingId(),
        customerName: 'Legacy User',
        email: 'legacy@email.com',
        phoneNumber: '+6287777777777',
        whatsappNumber: '+6287777777777',
        packageName: 'Paket Legacy',
        paymentMethod: 'Lunas'
      }

      const formData = new FormData()
      formData.append('phone', '6289685028129@s.whatsapp.net')
      formData.append('bookingData', JSON.stringify(legacyData))
      formData.append('caption', 'Konfirmasi pemesanan Umrah Anda - Format Legacy')

      const response = await fetch('/api/send-file', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setResult(`✅ PDF berhasil dikirim! Booking ID: ${legacyData.bookingId}`)
      } else {
        const errorData = await response.json()
        setError(`❌ Error: ${errorData.error}`)
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Example 4: Download PDF without sending
  const handleDownloadTest = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const testData = createDefaultUmrahFormData({
        name: 'Download Test User',
        email: 'download@email.com',
        phone_number: '+6288888888888',
        umrah_package: 'Paket Download Test',
        payment_method: 'lunas',
      })

      const bookingId = generateBookingId()

      const response = await fetch('/api/test-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: testData,
          bookingId: bookingId,
        }),
      })

      if (response.ok) {
        // Download PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `confirmation-${bookingId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setResult(`✅ PDF berhasil didownload! Booking ID: ${bookingId}`)
      } else {
        const errorData = await response.json()
        setError(`❌ Error: ${errorData.error}`)
      }
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Confirmation PDF - Example Usage
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Complete Data Test */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 text-green-700">
              1. Complete Data Test
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Test dengan data lengkap (semua field terisi)
            </p>
            <button
              onClick={handleCompleteDataTest}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Processing...' : 'Send Complete Data PDF'}
            </button>
          </div>

          {/* Minimal Data Test */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">
              2. Minimal Data Test
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Test dengan data minimal (hanya field wajib)
            </p>
            <button
              onClick={handleMinimalDataTest}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Processing...' : 'Send Minimal Data PDF'}
            </button>
          </div>

          {/* Legacy Format Test */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 text-orange-700">
              3. Legacy Format Test
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Test backward compatibility dengan format lama
            </p>
            <button
              onClick={handleLegacyDataTest}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Processing...' : 'Send Legacy Format PDF'}
            </button>
          </div>

          {/* Download Test */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 text-purple-700">
              4. Download Test
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Download PDF tanpa mengirim via WhatsApp
            </p>
            <button
              onClick={handleDownloadTest}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Processing...' : 'Download PDF Only'}
            </button>
          </div>
        </div>

        {/* Results */}
        {(result || error) && (
          <div className="mb-8">
            {result && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {result}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Documentation */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How it Works</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Complete Data:</strong> Menggunakan semua field dari UmrahFormData dengan data lengkap
            </div>
            <div>
              <strong>2. Minimal Data:</strong> Hanya mengisi field wajib, sisanya akan menggunakan default values
            </div>
            <div>
              <strong>3. Legacy Format:</strong> Menggunakan format BookingData lama untuk backward compatibility
            </div>
            <div>
              <strong>4. Download Only:</strong> Generate dan download PDF tanpa mengirim ke WhatsApp
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Semua test akan mengirim PDF ke WhatsApp number yang dikonfigurasi 
              di environment variables. Pastikan WhatsApp API sudah dikonfigurasi dengan benar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
