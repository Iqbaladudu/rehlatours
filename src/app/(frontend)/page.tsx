'use client'

import { useState, useEffect } from 'react'
import { UmrahForm } from '@/components/umrah-form'
import { handleUmrahFormSubmission, getPackageOptions } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Package, Loader2 } from 'lucide-react'

interface UmrahPackage {
  id: string
  name: string
}

export default function UmrahFormPage() {
  const [packages, setPackages] = useState<UmrahPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const result = await getPackageOptions()

      if (result.success && result.data) {
        setPackages(result.data)
        setError(null)
      } else {
        console.error('Error fetching packages:', result.error)
        setError(result.error || 'Gagal mengambil daftar paket')
        setPackages([])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('Terjadi kesalahan saat mengambil daftar paket')
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    console.log('=== PAGE HANDLE SUBMIT START ===')
    console.log('Page received form data:', formData)
    console.log('Form data type:', typeof formData)
    console.log('Form data keys:', formData ? Object.keys(formData) : 'null/undefined')

    try {
      console.log('Page: About to call handleUmrahFormSubmission...')
      const result = await handleUmrahFormSubmission(formData)

      console.log('Page: handleUmrahFormSubmission returned:')
      console.log('Result:', result)
      console.log('=== PAGE HANDLE SUBMIT SUCCESS ===')

      // Jika berhasil, redirect ke halaman sukses
      if (result.success && result.data) {
        const { id, booking_id, message } = result.data
        const successUrl = new URL('/success', window.location.origin)
        successUrl.searchParams.set('id', id)
        successUrl.searchParams.set('booking_id', booking_id)
        successUrl.searchParams.set('name', formData.name)
        successUrl.searchParams.set('message', encodeURIComponent(message))

        window.location.href = successUrl.toString()
        return result
      }

      return result
    } catch (error) {
      console.log('=== PAGE HANDLE SUBMIT ERROR ===')
      console.error('Page error type:', typeof error)
      console.error('Page error constructor:', error?.constructor?.name)
      console.error('Page error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Full page error:', error)

      if (error instanceof Error && error.stack) {
        console.error('Page error stack:')
        console.error(error.stack)
      }

      if (error instanceof Error && error.message.includes('Maximum call stack')) {
        console.log('DETECTED: Stack overflow in page handler!')
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga',
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: '#3a051920' }}
            >
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3a0519' }} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Memuat Data...</h2>
            <p className="text-gray-600">Mengambil informasi paket umroh tersedia</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Terjadi Kesalahan
              </h2>
            </div>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gagal Memuat Data</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={fetchPackages}
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  className="flex-1 text-white transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #3a0519 0%, #5d1f35 100%)' }}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 px-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3a0519 0%, #5d1f35 100%)' }}
          >
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #3a0519 0%, #5d1f35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Pendaftaran Umroh
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Daftarkan diri Anda untuk perjalanan spiritual yang tak terlupakan dengan paket umroh
            terbaik kami.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Informasi Penting
                </h2>
              </div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Tidak Ada Paket Tersedia
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Saat ini tidak ada paket umroh yang tersedia. Silakan hubungi admin untuk
                  informasi lebih lanjut atau coba lagi nanti.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={fetchPackages}
                    variant="outline"
                    className="flex-1 transition-all duration-200 hover:scale-105"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/')}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all duration-200 hover:scale-105"
                  >
                    Kembali ke Beranda
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <UmrahForm packages={packages} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  )
}
