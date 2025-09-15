'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Calendar as CalendarIcon,
  User,
  MapPin,
  Heart,
  FileText,
  Phone,
  AlertTriangle,
  Package,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { umrahFormSchema, type UmrahFormData } from '@/lib/validations'
import { UmrahPackage } from '@/payload-types'

interface UmrahFormProps {
  packages: UmrahPackage[]
  onSubmit: (data: UmrahFormData) => Promise<{ success: boolean; data?: any; error?: string }>
  isSubmitting?: boolean
}

const FormSection = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any
  title: string
  description: string
  children: React.ReactNode
}) => (
  <div className="group">
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mr-4 group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300 shadow-sm">
        <Icon className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      {children}
    </div>
  </div>
)

const FormField = ({
  label,
  error,
  children,
  required = false,
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 flex items-center">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-sm text-red-500 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
)

export function UmrahForm({ packages, onSubmit, isSubmitting = false }: UmrahFormProps) {
  const [showIllnessField, setShowIllnessField] = useState(false)
  const [showRegisterCalendar, setShowRegisterCalendar] = useState(false)
  const [showBirthCalendar, setShowBirthCalendar] = useState(false)
  const [showIssueCalendar, setShowIssueCalendar] = useState(false)
  const [showExpiryCalendar, setShowExpiryCalendar] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<UmrahFormData>({
    resolver: zodResolver(umrahFormSchema),
    defaultValues: {
      specific_disease: false,
      special_needs: false,
      wheelchair: false,
      has_performed_umrah: false,
      has_performed_hajj: false,
      terms_of_service: false,
    },
  })

  const watchSpecificDisease = watch('specific_disease')
  const watchRegisterDate = watch('register_date')
  const watchBirthDate = watch('birth_date')
  const watchDateOfIssue = watch('date_of_issue')
  const watchExpiryDate = watch('expiry_date')

  useEffect(() => {
    setShowIllnessField(watchSpecificDisease)
    if (!watchSpecificDisease) {
      setValue('illness', undefined)
    }
  }, [watchSpecificDisease, setValue])

  const onSubmitHandler = async (data: UmrahFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pendaftaran Umrah</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Daftar perjalanan umrah Anda dengan mudah dan aman. Isi formulir di bawah dengan
            lengkap.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit(onSubmitHandler)} className="p-8 lg:p-12 space-y-8">
            {/* Personal Information */}
            <FormSection
              icon={User}
              title="Informasi Pribadi"
              description="Masukkan data diri Anda sesuai dengan dokumen resmi"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nama Lengkap" error={errors.full_name?.message} required>
                  <Input
                    {...register('full_name')}
                    placeholder="Contoh: Ahmad Sulaiman"
                    className="h-12"
                  />
                </FormField>

                <FormField
                  label="NIK (Nomor Induk Kependudukan)"
                  error={errors.nik?.message}
                  required
                >
                  <Input
                    {...register('nik')}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    className="h-12"
                  />
                </FormField>

                <FormField label="Tempat Lahir" error={errors.place_of_birth?.message} required>
                  <Input
                    {...register('place_of_birth')}
                    placeholder="Contoh: Jakarta"
                    className="h-12"
                  />
                </FormField>

                <FormField label="Tanggal Lahir" error={errors.birth_date?.message} required>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !watchBirthDate && 'text-muted-foreground',
                      )}
                      onClick={() => setShowBirthCalendar(!showBirthCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchBirthDate
                        ? format(watchBirthDate, 'dd/MM/yyyy')
                        : 'Pilih tanggal lahir'}
                    </Button>
                    {showBirthCalendar && (
                      <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-xl">
                        <Calendar
                          mode="single"
                          selected={watchBirthDate}
                          onSelect={(date) => {
                            if (date) {
                              setValue('birth_date', date, { shouldValidate: true })
                              setShowBirthCalendar(false)
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Jenis Kelamin" error={errors.gender?.message} required>
                  <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Status Pernikahan"
                  error={errors.marital_status?.message}
                  required
                >
                  <Select
                    onValueChange={(value) =>
                      setValue(
                        'marital_status',
                        value as 'single' | 'married' | 'divorced' | 'widowed',
                      )
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih status pernikahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Belum Menikah</SelectItem>
                      <SelectItem value="married">Menikah</SelectItem>
                      <SelectItem value="divorced">Cerai</SelectItem>
                      <SelectItem value="widowed">Janda/Duda</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Pekerjaan" error={errors.occupation?.message} required>
                  <Input
                    {...register('occupation')}
                    placeholder="Contoh: Pegawai Swasta"
                    className="h-12"
                  />
                </FormField>

                <FormField label="Pendidikan Terakhir" error={errors.education?.message} required>
                  <Select
                    onValueChange={(value) =>
                      setValue(
                        'education',
                        value as 'sd' | 'smp' | 'sma' | 'diploma' | 's1' | 's2' | 's3',
                      )
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih pendidikan terakhir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD/Sederajat</SelectItem>
                      <SelectItem value="smp">SMP/Sederajat</SelectItem>
                      <SelectItem value="sma">SMA/Sederajat</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="s1">Sarjana (S1)</SelectItem>
                      <SelectItem value="s2">Magister (S2)</SelectItem>
                      <SelectItem value="s3">Doktor (S3)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormSection>

            {/* Contact Information */}
            <FormSection
              icon={Phone}
              title="Informasi Kontak"
              description="Data kontak untuk komunikasi dan koordinasi"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nomor Telepon" error={errors.phone?.message} required>
                  <Input
                    {...register('phone')}
                    placeholder="Contoh: 08123456789"
                    className="h-12"
                  />
                </FormField>

                <FormField label="Email" error={errors.email?.message} required>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="contoh@email.com"
                    className="h-12"
                  />
                </FormField>

                <FormField label="Alamat Lengkap" error={errors.address?.message} required>
                  <Textarea
                    {...register('address')}
                    placeholder="Alamat lengkap dengan RT/RW, Kelurahan, Kecamatan"
                    className="min-h-[100px] resize-none"
                  />
                </FormField>

                <FormField
                  label="Kontak Darurat"
                  error={errors.emergency_contact?.message}
                  required
                >
                  <Input
                    {...register('emergency_contact')}
                    placeholder="Nama dan nomor kontak darurat"
                    className="h-12"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Passport Information */}
            <FormSection
              icon={CreditCard}
              title="Informasi Paspor"
              description="Data paspor untuk keperluan perjalanan"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nomor Paspor" error={errors.passport_number?.message} required>
                  <Input
                    {...register('passport_number')}
                    placeholder="Contoh: A1234567"
                    className="h-12"
                  />
                </FormField>

                <FormField
                  label="Tanggal Penerbitan"
                  error={errors.date_of_issue?.message}
                  required
                >
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !watchDateOfIssue && 'text-muted-foreground',
                      )}
                      onClick={() => setShowIssueCalendar(!showIssueCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchDateOfIssue ? format(watchDateOfIssue, 'dd/MM/yyyy') : 'Pilih tanggal'}
                    </Button>
                    {showIssueCalendar && (
                      <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-xl">
                        <Calendar
                          mode="single"
                          selected={watchDateOfIssue}
                          onSelect={(date) => {
                            if (date) {
                              setValue('date_of_issue', date, { shouldValidate: true })
                              setShowIssueCalendar(false)
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Tanggal Kadaluarsa" error={errors.expiry_date?.message} required>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !watchExpiryDate && 'text-muted-foreground',
                      )}
                      onClick={() => setShowExpiryCalendar(!showExpiryCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchExpiryDate ? format(watchExpiryDate, 'dd/MM/yyyy') : 'Pilih tanggal'}
                    </Button>
                    {showExpiryCalendar && (
                      <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-xl">
                        <Calendar
                          mode="single"
                          selected={watchExpiryDate}
                          onSelect={(date) => {
                            if (date) {
                              setValue('expiry_date', date, { shouldValidate: true })
                              setShowExpiryCalendar(false)
                            }
                          }}
                          disabled={(date) => date <= new Date()}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField
                  label="Tempat Penerbitan"
                  error={errors.place_of_issue?.message}
                  required
                >
                  <Input
                    {...register('place_of_issue')}
                    placeholder="Contoh: Jakarta"
                    className="h-12"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Package Selection */}
            <FormSection
              icon={Package}
              title="Pilihan Paket"
              description="Pilih paket umrah yang sesuai dengan kebutuhan Anda"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Paket Umrah" error={errors.package?.message} required>
                  <Select onValueChange={(value) => setValue('package', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih paket umrah" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.title} - Rp {pkg.price?.toLocaleString('id-ID')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Tanggal Pendaftaran"
                  error={errors.register_date?.message}
                  required
                >
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !watchRegisterDate && 'text-muted-foreground',
                      )}
                      onClick={() => setShowRegisterCalendar(!showRegisterCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchRegisterDate
                        ? format(watchRegisterDate, 'dd/MM/yyyy')
                        : 'Pilih tanggal'}
                    </Button>
                    {showRegisterCalendar && (
                      <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-xl">
                        <Calendar
                          mode="single"
                          selected={watchRegisterDate}
                          onSelect={(date) => {
                            if (date) {
                              setValue('register_date', date, { shouldValidate: true })
                              setShowRegisterCalendar(false)
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            </FormSection>

            {/* Health Information */}
            <FormSection
              icon={Heart}
              title="Informasi Kesehatan"
              description="Informasi kesehatan untuk persiapan perjalanan"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    {...register('specific_disease')}
                    id="specific_disease"
                    className="w-5 h-5"
                    onCheckedChange={(checked) => {
                      setValue('specific_disease', checked as boolean)
                      setShowIllnessField(checked as boolean)
                    }}
                  />
                  <Label htmlFor="specific_disease" className="text-sm font-medium text-gray-700">
                    Apakah Anda memiliki penyakit tertentu?
                  </Label>
                </div>

                {showIllnessField && (
                  <FormField label="Jenis Penyakit" error={errors.illness?.message} required>
                    <Textarea
                      {...register('illness')}
                      placeholder="Sebutkan jenis penyakit yang Anda miliki"
                      className="min-h-[80px] resize-none"
                    />
                  </FormField>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      {...register('special_needs')}
                      id="special_needs"
                      className="w-5 h-5"
                    />
                    <Label htmlFor="special_needs" className="text-sm font-medium text-gray-700">
                      Kebutuhan Khusus
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox {...register('wheelchair')} id="wheelchair" className="w-5 h-5" />
                    <Label htmlFor="wheelchair" className="text-sm font-medium text-gray-700">
                      Kursi Roda
                    </Label>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Religious Experience */}
            <FormSection
              icon={MapPin}
              title="Pengalaman Ibadah"
              description="Informasi pengalaman ibadah sebelumnya"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    {...register('has_performed_umrah')}
                    id="has_performed_umrah"
                    className="w-5 h-5"
                  />
                  <Label
                    htmlFor="has_performed_umrah"
                    className="text-sm font-medium text-gray-700"
                  >
                    Pernah melaksanakan Umrah sebelumnya
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    {...register('has_performed_hajj')}
                    id="has_performed_hajj"
                    className="w-5 h-5"
                  />
                  <Label htmlFor="has_performed_hajj" className="text-sm font-medium text-gray-700">
                    Pernah melaksanakan Haji
                  </Label>
                </div>
              </div>
            </FormSection>

            {/* Terms and Conditions */}
            <FormSection
              icon={FileText}
              title="Syarat dan Ketentuan"
              description="Pastikan Anda membaca dan menyetujui syarat dan ketentuan"
            >
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Persyaratan Umum:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Paspor masih berlaku minimal 6 bulan</li>
                    <li>• Sertifikat vaksin meningitis (bila diperlukan)</li>
                    <li>• Membayar biaya pendaftaran</li>
                    <li>• Mengikuti briefing sebelum keberangkatan</li>
                  </ul>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    {...register('terms_of_service')}
                    id="terms_of_service"
                    className="w-5 h-5 mt-1"
                  />
                  <Label
                    htmlFor="terms_of_service"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    Saya telah membaca dan menyetujui{' '}
                    <span className="text-emerald-600 font-medium">syarat dan ketentuan</span> yang
                    berlaku untuk perjalanan umrah ini. Saya memahami bahwa semua informasi yang
                    saya berikan adalah benar dan dapat dipertanggungjawabkan.
                  </Label>
                </div>
                {errors.terms_of_service && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.terms_of_service.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold py-4 text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Mengirim...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Kirim Pendaftaran
                  </div>
                )}
              </Button>
            </FormSection>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 Rehla Tours. Semua data akan dijaga kerahasiaannya.</p>
        </div>
      </div>
    </div>
  )
}
