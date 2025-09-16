import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ConfirmationPDF from './ConfirmationPDF'
import { UmrahFormData } from '@/types/form'

// Sample data for testing
const sampleFormData: UmrahFormData = {
  // Personal Information
  name: 'Ahmad Abdullah',
  register_date: '2024-01-15',
  gender: 'male',
  place_of_birth: 'Jakarta',
  birth_date: '1985-03-20',
  father_name: 'Abdullah Rahman',
  mother_name: 'Siti Aminah',

  // Address Information
  address: 'Jl. Merdeka No. 123',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postal_code: '12345',
  occupation: 'Software Engineer',

  // Health Information
  specific_disease: false,
  illness: '',
  special_needs: false,
  wheelchair: false,

  // Document Information
  nik_number: '3171012003850001',
  passport_number: 'A1234567',
  date_of_issue: '2023-01-01',
  expiry_date: '2028-01-01',
  place_of_issue: 'Jakarta',

  // Contact Information
  phone_number: '+6281234567890',
  whatsapp_number: '+6281234567890',
  email: 'ahmad.abdullah@email.com',

  // Pilgrimage History
  has_performed_umrah: false,
  has_performed_hajj: false,

  // Emergency Contact
  emergency_contact_name: 'Fatimah Abdullah',
  relationship: 'spouse',
  emergency_contact_phone: '+6281987654321',

  // Package Information
  mariage_status: 'married',
  umrah_package: 'Paket Umrah Premium 14 Hari',
  payment_method: 'lunas',

  // Terms
  terms_of_service: true,
}

const sampleBookingId = 'RT-6183-1758007466843'

export default function TestConfirmationPDF() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Confirmation PDF</h1>
      <div className="space-y-4">
        <PDFDownloadLink
          document={<ConfirmationPDF formData={sampleFormData} bookingId={sampleBookingId} />}
          fileName={`confirmation-${sampleBookingId}.pdf`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
        >
          {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : 'Download PDF'
          }
        </PDFDownloadLink>

        {/* Display sample data */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Sample Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({ formData: sampleFormData, bookingId: sampleBookingId }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
