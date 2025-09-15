import { WhatsAppService } from '@/lib/whatsapp-service'
import { CollectionConfig } from 'payload'

export const UmrahForm: CollectionConfig = {
  slug: 'umrah-form',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone_number', 'booking_id', 'status', 'createdAt'],
    description: 'Formulir pendaftaran umroh dengan validasi lengkap',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // System Fields
    {
      name: 'booking_id',
      type: 'text',
      required: true,
      label: 'ID Pemesanan',
      unique: true,
      admin: {
        readOnly: true,
        description: 'ID pemesanan otomatis dengan format RT-XXXX',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, operation }) => {
            if (operation === 'create' && !siblingData.booking_id) {
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
              let result = 'RT-'
              for (let i = 0; i < 4; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
              }
              siblingData.booking_id = result
            }
            return siblingData
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status Pendaftaran',
      defaultValue: 'pending_review',
      options: [
        { label: 'Menunggu Review', value: 'pending_review' },
        { label: 'Sedang Diproses', value: 'processing' },
        { label: 'Diterima', value: 'approved' },
        { label: 'Ditolak', value: 'rejected' },
        { label: 'Selesai', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'submission_date',
      type: 'date',
      label: 'Tanggal Submission',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, operation }) => {
            if (operation === 'create' && !siblingData.submission_date) {
              siblingData.submission_date = new Date()
            }
            return siblingData
          },
        ],
      },
    },

    // Personal Information Tab
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informasi Pribadi',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Nama sesuai Paspor',
              validate: (value: string) => {
                if (!value || value.length < 3) {
                  return 'Nama minimal 3 karakter'
                }
                if (value.length > 100) {
                  return 'Nama maksimal 100 karakter'
                }
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value)) {
                  return 'Nama hanya boleh mengandung huruf dan tanda baca umum'
                }
                if (value.trim().split(' ').length < 2) {
                  return 'Nama harus terdiri dari minimal 2 kata'
                }
                return true
              },
            },
            {
              name: 'register_date',
              type: 'date',
              required: true,
              label: 'Tanggal Pendaftaran',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
              validate: (value: Date) => {
                if (!value) return 'Tanggal pendaftaran wajib diisi'
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (value < today) {
                  return 'Tanggal pendaftaran tidak boleh di masa lalu'
                }
                return true
              },
            },
            {
              name: 'gender',
              type: 'select',
              required: true,
              label: 'Jenis Kelamin',
              options: [
                { label: 'Laki-Laki', value: 'male' },
                { label: 'Perempuan', value: 'female' },
              ],
            },
            {
              name: 'place_of_birth',
              type: 'text',
              required: true,
              label: 'Tempat Lahir',
              validate: (value: string) => {
                if (!value || value.length < 2) return 'Tempat lahir minimal 2 karakter'
                if (value.length > 50) return 'Tempat lahir maksimal 50 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value)) return 'Tempat lahir tidak valid'
                return true
              },
            },
            {
              name: 'birth_date',
              type: 'date',
              required: true,
              label: 'Tanggal Lahir',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
              validate: (value: Date) => {
                if (!value) return 'Tanggal lahir wajib diisi'
                const today = new Date()
                if (value >= today) return 'Tanggal lahir tidak boleh di masa depan'

                // Calculate age
                const age = today.getFullYear() - value.getFullYear()
                const monthDiff = today.getMonth() - value.getMonth()
                const finalAge =
                  monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())
                    ? age - 1
                    : age

                if (finalAge > 80) return 'Usia maksimal untuk umroh adalah 80 tahun'

                return true
              },
            },
            {
              name: 'father_name',
              type: 'text',
              required: true,
              label: 'Nama Ayah',
              validate: (value: string) => {
                if (!value || value.length < 3) return 'Nama ayah minimal 3 karakter'
                if (value.length > 100) return 'Nama ayah maksimal 100 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value))
                  return 'Nama ayah hanya boleh mengandung huruf dan tanda baca umum'
                return true
              },
            },
            {
              name: 'mother_name',
              type: 'text',
              required: true,
              label: 'Nama Ibu',
              validate: (value: string) => {
                if (!value || value.length < 3) return 'Nama ibu minimal 3 karakter'
                if (value.length > 100) return 'Nama ibu maksimal 100 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value))
                  return 'Nama ibu hanya boleh mengandung huruf dan tanda baca umum'
                return true
              },
            },
          ],
        },
        {
          label: 'Alamat & Pekerjaan',
          fields: [
            {
              name: 'address',
              type: 'textarea',
              required: true,
              label: 'Alamat Lengkap',
              validate: (value: string) => {
                if (!value || value.length < 10) return 'Alamat lengkap minimal 10 karakter'
                if (value.length > 300) return 'Alamat maksimal 300 karakter'
                if (value.trim().split(' ').length < 3) return 'Alamat harus lebih detail dan jelas'
                return true
              },
            },
            {
              name: 'city',
              type: 'text',
              required: true,
              label: 'Kota',
              validate: (value: string) => {
                if (!value || value.length < 2) return 'Kota minimal 2 karakter'
                if (value.length > 50) return 'Kota maksimal 50 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value)) return 'Nama kota tidak valid'
                return true
              },
            },
            {
              name: 'province',
              type: 'text',
              required: true,
              label: 'Provinsi',
              validate: (value: string) => {
                if (!value || value.length < 2) return 'Provinsi minimal 2 karakter'
                if (value.length > 50) return 'Provinsi maksimal 50 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value)) return 'Nama provinsi tidak valid'
                return true
              },
            },
            {
              name: 'postal_code',
              type: 'text',
              required: true,
              label: 'Kode Pos',
              validate: (value: string) => {
                if (!value) return 'Kode pos wajib diisi'
                if (!/^\d{5,6}$/.test(value)) return 'Kode pos harus terdiri dari 5-6 digit angka'
                return true
              },
            },
            {
              name: 'occupation',
              type: 'text',
              required: true,
              label: 'Pekerjaan',
              validate: (value: string) => {
                if (!value || value.length < 2) return 'Pekerjaan minimal 2 karakter'
                if (value.length > 100) return 'Pekerjaan maksimal 100 karakter'
                return true
              },
            },
          ],
        },
        {
          label: 'Kesehatan',
          fields: [
            {
              name: 'specific_disease',
              type: 'checkbox',
              label: 'Memiliki Penyakit Khusus',
              defaultValue: false,
            },
            {
              name: 'illness',
              type: 'textarea',
              label: 'Detail Penyakit',
              admin: {
                condition: (data: any) => data.specific_disease === true,
                description: 'Jelaskan detail penyakit yang dimiliki',
              },
              validate: (value: string, { siblingData }: any) => {
                if (siblingData.specific_disease && (!value || value.trim() === '')) {
                  return 'Detail penyakit wajib diisi jika memiliki penyakit khusus'
                }
                return true
              },
            },
            {
              name: 'special_needs',
              type: 'checkbox',
              label: 'Membutuhkan Penanganan Khusus',
              defaultValue: false,
            },
            {
              name: 'wheelchair',
              type: 'checkbox',
              label: 'Membutuhkan Kursi Roda saat Umroh',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Dokumen',
          fields: [
            {
              name: 'nik_number',
              type: 'text',
              required: true,
              label: 'NIK (16 digit)',
              unique: true,
              validate: (value: string) => {
                if (!value) return 'NIK wajib diisi'
                if (!/^\d{16}$/.test(value)) return 'NIK harus terdiri dari 16 digit angka'
                // Check if all digits are the same
                const allSame = value.split('').every((digit) => digit === value[0])
                if (allSame) return 'NIK tidak valid - tidak boleh semua digit sama'
                return true
              },
            },
            {
              name: 'passport_number',
              type: 'text',
              required: true,
              label: 'Nomor Paspor',
              unique: true,
              validate: (value: string) => {
                if (!value) return 'Nomor paspor wajib diisi'
                if (value.length < 6 || value.length > 15) return 'Nomor paspor harus 6-15 karakter'
                if (!/^[A-Z0-9]+$/.test(value.toUpperCase()))
                  return 'Nomor paspor hanya boleh mengandung huruf kapital dan angka'
                return true
              },
            },
            {
              name: 'date_of_issue',
              type: 'date',
              required: true,
              label: 'Tanggal Terbit Paspor',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
              validate: (value: Date) => {
                if (!value) return 'Tanggal terbit paspor wajib diisi'
                if (value > new Date()) return 'Tanggal terbit paspor tidak boleh di masa depan'
                return true
              },
            },
            {
              name: 'expiry_date',
              type: 'date',
              required: true,
              label: 'Tanggal Berakhir Paspor',
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
              validate: (value: Date, { siblingData }: any) => {
                if (!value) return 'Tanggal berakhir paspor wajib diisi'

                const sixMonthsFromNow = new Date()
                sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
                if (value <= sixMonthsFromNow)
                  return 'Paspor harus berlaku minimal 6 bulan dari sekarang'

                if (siblingData.date_of_issue && value <= siblingData.date_of_issue) {
                  return 'Tanggal berakhir harus setelah tanggal terbit'
                }

                return true
              },
            },
            {
              name: 'place_of_issue',
              type: 'text',
              required: true,
              label: 'Tempat Terbit Paspor',
              validate: (value: string) => {
                if (!value || value.length < 2) return 'Tempat terbit paspor minimal 2 karakter'
                if (value.length > 50) return 'Tempat terbit paspor maksimal 50 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value)) return 'Tempat terbit paspor tidak valid'
                return true
              },
            },
          ],
        },
        {
          label: 'Kontak',
          fields: [
            {
              name: 'phone_number',
              type: 'text',
              required: true,
              label: 'Nomor Telepon',
              validate: (value: string) => {
                if (!value) return 'Nomor telepon wajib diisi'
                const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,12}$/
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                  return 'Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)'
                }
                return true
              },
            },
            {
              name: 'whatsapp_number',
              type: 'text',
              required: true,
              label: 'Nomor WhatsApp',
              validate: (value: string) => {
                if (!value) return 'Nomor WhatsApp wajib diisi'
                const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,12}$/
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                  return 'Format nomor WhatsApp tidak valid (contoh: 08123456789 atau +628123456789)'
                }
                return true
              },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              label: 'Email',
              unique: true,
              validate: (value: string) => {
                if (!value) return 'Email wajib diisi'
                if (value.length > 255) return 'Email maksimal 255 karakter'

                // Check for common email domains
                const validDomains = [
                  'gmail.com',
                  'yahoo.com',
                  'outlook.com',
                  'hotmail.com',
                  'icloud.com',
                ]
                const domain = value.toLowerCase().split('@')[1]
                if (!validDomains.includes(domain) && !domain.includes('.')) {
                  return 'Gunakan email dengan domain yang valid'
                }
                return true
              },
            },
          ],
        },
        {
          label: 'Riwayat & Kontak Darurat',
          fields: [
            {
              name: 'has_performed_umrah',
              type: 'checkbox',
              label: 'Sudah pernah umroh',
              defaultValue: false,
            },
            {
              name: 'has_performed_hajj',
              type: 'checkbox',
              label: 'Sudah pernah haji',
              defaultValue: false,
            },
            {
              name: 'emergency_contact_name',
              type: 'text',
              required: true,
              label: 'Nama Kontak Darurat',
              validate: (value: string) => {
                if (!value || value.length < 3) return 'Nama kontak darurat minimal 3 karakter'
                if (value.length > 100) return 'Nama kontak darurat maksimal 100 karakter'
                if (!/^[a-zA-Z\s\.,'-]+$/.test(value))
                  return 'Nama kontak darurat hanya boleh mengandung huruf dan tanda baca umum'
                return true
              },
            },
            {
              name: 'relationship',
              type: 'select',
              required: true,
              label: 'Hubungan',
              options: [
                { label: 'Orang Tua', value: 'parents' },
                { label: 'Suami/Istri', value: 'spouse' },
                { label: 'Anak', value: 'children' },
                { label: 'Saudara', value: 'sibling' },
                { label: 'Kerabat', value: 'relative' },
              ],
            },
            {
              name: 'emergency_contact_phone',
              type: 'text',
              required: true,
              label: 'Nomor Telepon Kontak Darurat',
              validate: (value: string) => {
                if (!value) return 'Nomor telepon kontak darurat wajib diisi'
                const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,12}$/
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                  return 'Format nomor telepon kontak darurat tidak valid'
                }
                return true
              },
            },
          ],
        },
        {
          label: 'Paket & Pembayaran',
          fields: [
            {
              name: 'mariage_status',
              type: 'select',
              required: true,
              label: 'Status Pernikahan',
              options: [
                { label: 'Belum Menikah', value: 'single' },
                { label: 'Menikah', value: 'married' },
                { label: 'Janda/Duda', value: 'divorced' },
              ],
            },
            {
              name: 'umrah_package',
              type: 'relationship',
              relationTo: 'umrah-package',
              required: true,
              label: 'Pilih Paket Umroh',
              hasMany: false,
            },
            {
              name: 'payment_method',
              type: 'select',
              required: true,
              label: 'Metode Pembayaran',
              options: [
                { label: 'Lunas', value: 'lunas' },
                { label: 'Cicilan 60% pertama', value: '60_percent' },
              ],
            },
            {
              name: 'terms_of_service',
              type: 'checkbox',
              required: true,
              label: 'Persetujuan Syarat dan Ketentuan',
              validate: (value: boolean) => {
                if (!value) return 'Anda harus menyetujui syarat dan ketentuan'
                return true
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-populate submission_date on create
        if (operation === 'create' && !data.submission_date) {
          data.submission_date = new Date()
        }

        // Normalize phone numbers
        if (data.phone_number) {
          data.phone_number = data.phone_number.replace(/\s/g, '')
        }
        if (data.whatsapp_number) {
          data.whatsapp_number = data.whatsapp_number.replace(/\s/g, '')
        }
        if (data.emergency_contact_phone) {
          data.emergency_contact_phone = data.emergency_contact_phone.replace(/\s/g, '')
        }

        // Normalize text fields
        if (data.name) data.name = data.name.trim().replace(/\s+/g, ' ')
        if (data.father_name) data.father_name = data.father_name.trim().replace(/\s+/g, ' ')
        if (data.mother_name) data.mother_name = data.mother_name.trim().replace(/\s+/g, ' ')
        if (data.place_of_birth)
          data.place_of_birth = data.place_of_birth.trim().replace(/\s+/g, ' ')
        if (data.address) data.address = data.address.trim().replace(/\s+/g, ' ')
        if (data.city) data.city = data.city.trim().replace(/\s+/g, ' ')
        if (data.province) data.province = data.province.trim().replace(/\s+/g, ' ')
        if (data.occupation) data.occupation = data.occupation.trim().replace(/\s+/g, ' ')
        if (data.place_of_issue)
          data.place_of_issue = data.place_of_issue.trim().replace(/\s+/g, ' ')
        if (data.emergency_contact_name)
          data.emergency_contact_name = data.emergency_contact_name.trim().replace(/\s+/g, ' ')

        // Normalize email
        if (data.email) data.email = data.email.toLowerCase().trim()

        // Normalize passport number
        if (data.passport_number) data.passport_number = data.passport_number.toUpperCase().trim()

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New Umrah form submitted: ${doc.booking_id} by ${doc.name}`)
        } else if (operation === 'update') {
          console.log(`Umrah form updated: ${doc.booking_id} by ${doc.name}`)
        }

        // Send WhatsApp notification for both create and update
        try {
          const whatsappService = new WhatsAppService()

          const phone = doc.whatsapp_number || doc.phone_number
          if (phone) {
            const message = whatsappService.generateConfirmationMessage(doc, operation)
            const normalizedPhone = whatsappService.normalizePhoneNumber(phone)

            await whatsappService.sendMessage({
              phone: normalizedPhone,
              message,
              duration: 3600,
            })

            console.log(`WhatsApp notification sent for booking ${doc.booking_id} (${operation})`)
          }
        } catch (error) {
          console.error('Failed to send WhatsApp notification:', error)
        }
      },
    ],
  },
}
