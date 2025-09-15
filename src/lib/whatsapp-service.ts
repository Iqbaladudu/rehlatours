import axios from 'axios'

interface WhatsAppMessageData {
  phone: string
  message: string
  reply_message_id?: string
  is_forwarded?: boolean
  duration?: number
}

interface WhatsAppConfig {
  endpoint: string
  username: string
  password: string
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = {
      endpoint: process.env.WHATSAPP_API_ENDPOINT || '',
      username: process.env.WHATSAPP_API_USERNAME || '',
      password: process.env.WHATSAPP_API_PASSWORD || '',
    }

    if (!this.config.endpoint || !this.config.username || !this.config.password) {
      console.warn('WhatsApp API configuration missing in environment variables')
    }
  }

  async sendMessage(data: WhatsAppMessageData): Promise<boolean> {
    try {
      if (!this.config.endpoint || !this.config.username || !this.config.password) {
        console.error('WhatsApp API configuration missing')
        return false
      }

      console.log('Sending WhatsApp message:', {
        endpoint: `${this.config.endpoint}/send/message`,
        phone: data.phone,
        message: data.message,
      })

      const response = await axios.post(
        `${this.config.endpoint}/send/message`,
        {
          phone: data.phone,
          message: data.message,
          reply_message_id: data.reply_message_id,
          is_forwarded: data.is_forwarded || false,
          duration: data.duration || 3600,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          auth: {
            username: this.config.username,
            password: this.config.password,
          },
        }
      )

      console.log('WhatsApp message sent successfully:', response.data)
      return true
    } catch (error: any) {
      console.error('Failed to send WhatsApp message:', error)
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
        })
      }
      return false
    }
  }

  generateConfirmationMessage(formData: any, operation: 'create' | 'update' = 'create'): string {
    const statusMessages = {
      pending_review: 'sedang dalam tahap review',
      processing: 'sedang diproses',
      approved: 'telah disetujui',
      rejected: 'telah ditolak',
      completed: 'telah selesai',
    }

    const statusText = statusMessages[formData.status] || 'diproses'
    const operationText = operation === 'create' ? 'Terima kasih telah mendaftar' : 'Update pendaftaran Anda'
    const actionText = operation === 'create' ? 'Pendaftaran Anda' : 'Status pendaftaran Anda'

    return `*Assalamualaikum ${formData.name}*

${operationText} Umroh bersama Rehla Tours.

*Detail Pendaftaran:*
📋 ID Pemesanan: ${formData.booking_id}
📅 Tanggal Pendaftaran: ${formData.register_date || formData.submission_date}
👤 Nama: ${formData.name}
📱 WhatsApp: ${formData.whatsapp_number || formData.phone_number}
📧 Email: ${formData.email}
🏷️ Status: ${statusText}

${actionText} ${statusText}. Kami akan menghubungi Anda kembali untuk informasi selanjutnya.

*Rehla Tours*
📞 0812-3456-7890
🌐 www.rehlatours.com`
  }

  normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Convert to international format for WhatsApp API
    // API expects format: 62xxx (without @s.whatsapp.net)
    if (cleaned.startsWith('0')) {
      return `62${cleaned.substring(1)}`
    }
    if (cleaned.startsWith('62')) {
      return cleaned
    }
    if (cleaned.startsWith('8')) {
      return `62${cleaned}`
    }
    
    // If already in international format
    return cleaned
  }
}