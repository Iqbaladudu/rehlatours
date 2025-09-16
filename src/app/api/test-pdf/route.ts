import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import ConfirmationPDF from '@/components/ConfirmationPDF'
import { UmrahFormData } from '@/types/form'

// Sample data for testing
const sampleFormData: UmrahFormData = {
  name: 'Ahmad Abdullah',
  register_date: '2024-01-15',
  gender: 'male',
  place_of_birth: 'Jakarta',
  birth_date: '1985-03-20',
  father_name: 'Abdullah Rahman',
  mother_name: 'Siti Aminah',
  address: 'Jl. Merdeka No. 123',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postal_code: '12345',
  occupation: 'Software Engineer',
  specific_disease: false,
  illness: '',
  special_needs: false,
  wheelchair: false,
  nik_number: '3171012003850001',
  passport_number: 'A1234567',
  date_of_issue: '2023-01-01',
  expiry_date: '2028-01-01',
  place_of_issue: 'Jakarta',
  phone_number: '+6281234567890',
  whatsapp_number: '+6281234567890',
  email: 'ahmad.abdullah@email.com',
  has_performed_umrah: false,
  has_performed_hajj: false,
  emergency_contact_name: 'Fatimah Abdullah',
  relationship: 'spouse',
  emergency_contact_phone: '+6281987654321',
  mariage_status: 'married',
  umrah_package: 'Paket Umrah Premium 14 Hari',
  payment_method: 'lunas',
  terms_of_service: true,
}

export async function GET(request: NextRequest) {
  try {
    const bookingId = 'RT-TEST-' + Date.now()
    
    // Generate PDF buffer
    const pdfDocument = createElement(ConfirmationPDF, { formData: sampleFormData, bookingId })
    const pdfBuffer = await renderToBuffer(pdfDocument as any)

    // Return PDF response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="confirmation-${bookingId}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, bookingId } = body

    if (!formData || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required data: formData and bookingId' },
        { status: 400 }
      )
    }

    // Validate formData structure
    const requiredFields = ['name', 'email', 'phone_number']
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Generate PDF buffer
    const pdfDocument = createElement(ConfirmationPDF, { formData, bookingId })
    const pdfBuffer = await renderToBuffer(pdfDocument as any)

    // Return PDF response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="confirmation-${bookingId}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
