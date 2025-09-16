import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import ConfirmationPDF from '@/components/ConfirmationPDF'
import { UmrahFormData } from '@/types/form'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

// Legacy interface for backward compatibility
interface LegacyBookingData {
  bookingId: string
  customerName: string
  email: string
  whatsappNumber: string
  phoneNumber: string
  packageName: string
  paymentMethod: string
}

// Function to convert legacy booking data to UmrahFormData
function convertLegacyToUmrahData(legacyData: LegacyBookingData): UmrahFormData {
  return {
    name: legacyData.customerName || '',
    register_date: new Date().toISOString().split('T')[0],
    gender: 'male', // default
    place_of_birth: '',
    birth_date: '',
    father_name: '',
    mother_name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    occupation: '',
    specific_disease: false,
    illness: '',
    special_needs: false,
    wheelchair: false,
    nik_number: '',
    passport_number: '',
    date_of_issue: '',
    expiry_date: '',
    place_of_issue: '',
    phone_number: legacyData.phoneNumber || '',
    whatsapp_number: legacyData.whatsappNumber || '',
    email: legacyData.email || '',
    has_performed_umrah: false,
    has_performed_hajj: false,
    emergency_contact_name: '',
    relationship: 'parents',
    emergency_contact_phone: '',
    mariage_status: 'single',
    umrah_package: legacyData.packageName || '',
    payment_method: legacyData.paymentMethod === 'Lunas' ? 'lunas' : '60_percent',
    terms_of_service: true,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const phone = formData.get('phone') as string
    const bookingDataJson = formData.get('bookingData') as string
    const umrahFormDataJson = formData.get('umrahFormData') as string
    const caption =
      (formData.get('caption') as string) ||
      'Terima kasih atas pemesanan Anda. Berikut adalah konfirmasi pemesanan Anda.'
    const is_forwarded = formData.get('is_forwarded') === 'true'
    const duration = parseInt(formData.get('duration') as string) || 3600

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Check WhatsApp API configuration
    const whatsappEndpoint = process.env.WHATSAPP_API_ENDPOINT
    const whatsappUsername = process.env.WHATSAPP_API_USERNAME
    const whatsappPassword = process.env.WHATSAPP_API_PASSWORD

    if (!whatsappEndpoint || !whatsappUsername || !whatsappPassword) {
      console.error('WhatsApp API configuration missing in environment variables')
      return NextResponse.json({ error: 'WhatsApp API configuration missing' }, { status: 500 })
    }

    let umrahFormData: UmrahFormData
    let bookingId: string

    // Try to parse umrahFormData first (new format), then fall back to legacy bookingData
    if (umrahFormDataJson) {
      try {
        const parsedUmrahData = JSON.parse(umrahFormDataJson)
        umrahFormData = parsedUmrahData
        bookingId = formData.get('bookingId') as string || `RT-${Date.now()}`
      } catch (error) {
        console.error('Error parsing umrahFormData:', error)
        return NextResponse.json({ error: 'Invalid umrahFormData format' }, { status: 400 })
      }
    } else if (bookingDataJson) {
      try {
        const legacyBookingData: LegacyBookingData = JSON.parse(bookingDataJson)
        umrahFormData = convertLegacyToUmrahData(legacyBookingData)
        bookingId = legacyBookingData.bookingId || `RT-${Date.now()}`
      } catch (error) {
        console.error('Error parsing bookingData:', error)
        return NextResponse.json({ error: 'Invalid bookingData format' }, { status: 400 })
      }
    } else {
      return NextResponse.json(
        { error: 'Either umrahFormData or bookingData is required' },
        { status: 400 }
      )
    }

    // Generate PDF using the safe createElement approach
    const pdfDocument = createElement(ConfirmationPDF, { formData: umrahFormData, bookingId })
    const pdfBuffer = await renderToBuffer(pdfDocument as any)

    // Create temporary file
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const fileName = `confirmation-${bookingId}-${Date.now()}.pdf`
    const filePath = path.join(tempDir, fileName)

    fs.writeFileSync(filePath, pdfBuffer as any)

    // Create form data for WhatsApp API
    const whatsappForm = new FormData()
    whatsappForm.append('phone', phone)
    whatsappForm.append('caption', caption)
    whatsappForm.append('file', fs.createReadStream(filePath), fileName)
    whatsappForm.append('is_forwarded', is_forwarded.toString())
    whatsappForm.append('duration', duration.toString())

    // Send to WhatsApp API
    const whatsappResponse = await axios.post(
      `${process.env.WHATSAPP_API_ENDPOINT}/send/file`,
      whatsappForm,
      {
        headers: {
          ...whatsappForm.getHeaders(),
        },
        auth: {
          username: whatsappUsername,
          password: whatsappPassword,
        },
      },
    )

    // Clean up temporary file
    fs.unlinkSync(filePath)

    if (whatsappResponse.status < 200 || whatsappResponse.status >= 300) {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: whatsappResponse.data },
        { status: whatsappResponse.status },
      )
    }

    const result = whatsappResponse.data

    return NextResponse.json({
      success: true,
      message: 'PDF confirmation sent successfully',
      bookingId: bookingId,
      phone: phone,
      timestamp: new Date().toISOString(),
      whatsappResponse: result,
    })
  } catch (error) {
    console.error('Error sending PDF confirmation:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send PDF Confirmation API',
    usage: {
      method: 'POST',
      endpoint: '/api/send-file',
      body: {
        phone: '6289685028129@s.whatsapp.net',
        // New format (preferred)
        umrahFormData: 'JSON string of UmrahFormData',
        bookingId: 'string',
        // Legacy format (backward compatibility)
        bookingData: {
          bookingId: 'string',
          customerName: 'string',
          email: 'string',
          whatsappNumber: 'string',
          phoneNumber: 'string',
          packageName: 'string',
          paymentMethod: 'string',
        },
        caption: 'string (optional)',
        is_forwarded: 'boolean (optional)',
        duration: 'number (optional)',
      },
    },
  })
}
