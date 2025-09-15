'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { FormProgress, FORM_STEPS } from '@/components/ui/form-progress'
import { FieldWrapper } from '@/components/ui/validation-indicator'
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
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { umrahFormSchema, type UmrahFormData } from '@/lib/validations'

interface UmrahPackage {
  id: string
  name: string
}

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
  description,
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
  description?: string
}) => (
  <FieldWrapper
    label={label}
    required={required}
    description={description}
    error={error}
    isDirty={!!error}
    isValid={!error}
  >
    {children}
  </FieldWrapper>
)

export function UmrahForm({ packages, onSubmit, isSubmitting = false }: UmrahFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showIllnessField, setShowIllnessField] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Calendar states
  const [showRegisterCalendar, setShowRegisterCalendar] = useState(false)
  const [showBirthCalendar, setShowBirthCalendar] = useState(false)
  const [showIssueCalendar, setShowIssueCalendar] = useState(false)
  const [showExpiryCalendar, setShowExpiryCalendar] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, touchedFields },
    trigger,
    clearErrors,
    control,
  } = useForm<UmrahFormData>({
    resolver: zodResolver(umrahFormSchema),
    mode: 'onChange',
    defaultValues: {
      specific_disease: false,
      special_needs: false,
      wheelchair: false,
      has_performed_umrah: false,
      has_performed_hajj: false,
      terms_of_service: false,
    },
  })

  // Watch form values
  const watchedValues = useWatch({ control })
  const watchSpecificDisease = watch('specific_disease')
  const watchRegisterDate = watch('register_date')
  const watchBirthDate = watch('birth_date')
  const watchDateOfIssue = watch('date_of_issue')
  const watchExpiryDate = watch('expiry_date')

  // Update illness field visibility
  useEffect(() => {
    setShowIllnessField(watchSpecificDisease)
    if (!watchSpecificDisease) {
      setValue('illness', undefined)
      clearErrors('illness')
    }
  }, [watchSpecificDisease, setValue, clearErrors])

  // Calculate step completion
  const stepCompletion = useMemo(() => {
    const completedSteps = new Set<number>()
    const stepsWithErrors = new Set<number>()

    FORM_STEPS.forEach((step, stepIndex) => {
      const stepFields = step.fields
      const stepErrors = stepFields.filter(field => errors[field as keyof UmrahFormData])
      const stepTouched = stepFields.filter(field => touchedFields[field as keyof UmrahFormData])
      const stepValues = stepFields.filter(field => {
        const value = watch(field as keyof UmrahFormData)
        return value !== null && value !== undefined && value !== '' && value !== false
      })

      // Step has errors
      if (stepErrors.length > 0) {
        stepsWithErrors.add(stepIndex)
      }

      // Step is completed (all required fields filled and no errors)
      const requiredFields = stepFields.filter(field => {
        // Define which fields are required based on the schema
        const requiredFieldsList = [
          'name', 'register_date', 'gender', 'place_of_birth', 'birth_date', 'father_name', 'mother_name',
          'address', 'city', 'province', 'postal_code', 'occupation',
          'nik_number', 'passport_number', 'date_of_issue', 'expiry_date', 'place_of_issue',
          'phone_number', 'whatsapp_number', 'email',
          'emergency_contact_name', 'relationship', 'emergency_contact_phone',
          'mariage_status', 'umrah_package', 'payment_method', 'terms_of_service'
        ]
        return requiredFieldsList.includes(field)
      })

      const requiredFieldsCompleted = requiredFields.filter(field => {
        const value = watch(field as keyof UmrahFormData)
        return value !== null && value !== undefined && value !== '' && value !== false
      })

      if (requiredFieldsCompleted.length === requiredFields.length && stepErrors.length === 0) {
        completedSteps.add(stepIndex)
      }
    })

    return { completedSteps, stepsWithErrors }
  }, [errors, touchedFields, watch])

  const handleFormSubmit = async (data: UmrahFormData) => {
    setSubmitStatus('submitting')
    try {
      const result = await onSubmit(data)
      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage('Pendaftaran berhasil! Terima kasih telah mendaftar.')
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Terjadi kesalahan saat mengirim formulir.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Terjadi kesalahan tidak terduga. Silakan coba lagi.')
    }
  }

  const nextStep = async () => {
    const currentStepFields = FORM_STEPS[currentStep].fields
    const isStepValid = await trigger(currentStepFields as any)
    
    if (isStepValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <FormSection icon={User} title="Informasi Pribadi" description="Data pribadi sesuai identitas resmi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Nama sesuai Paspor" 
                error={errors.name?.message} 
                required
                description="Masukkan nama lengkap sesuai paspor"
              >
                <Input
                  {...register('name')}
                  placeholder="Nama lengkap sesuai paspor"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField 
                label="Tanggal Pendaftaran" 
                error={errors.register_date?.message} 
                required
                description="Pilih tanggal pendaftaran"
              >
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchRegisterDate && 'text-muted-foreground'
                    )}
                    onClick={() => setShowRegisterCalendar(!showRegisterCalendar)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchRegisterDate ? format(watchRegisterDate, 'dd/MM/yyyy') : 'Pilih tanggal'}
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

              <FormField label="Jenis Kelamin" error={errors.gender?.message} required>
                <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female', { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-Laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tempat Lahir" error={errors.place_of_birth?.message} required>
                <Input
                  {...register('place_of_birth')}
                  placeholder="Tempat lahir"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField label="Tanggal Lahir" error={errors.birth_date?.message} required>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchBirthDate && 'text-muted-foreground'
                    )}
                    onClick={() => setShowBirthCalendar(!showBirthCalendar)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchBirthDate ? format(watchBirthDate, 'dd/MM/yyyy') : 'Pilih tanggal lahir'}
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

              <FormField label="Nama Ayah" error={errors.father_name?.message} required>
                <Input
                  {...register('father_name')}
                  placeholder="Nama ayah"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField label="Nama Ibu" error={errors.mother_name?.message} required>
                <Input
                  {...register('mother_name')}
                  placeholder="Nama ibu"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>
            </div>
          </FormSection>
        )

      case 1: // Address Information
        return (
          <FormSection icon={MapPin} title="Informasi Alamat" description="Alamat tempat tinggal saat ini">
            <div className="space-y-6">
              <FormField label="Alamat Lengkap" error={errors.address?.message} required>
                <Textarea
                  {...register('address')}
                  placeholder="Alamat lengkap dan detail"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Kota" error={errors.city?.message} required>
                  <Input
                    {...register('city')}
                    placeholder="Kota"
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>

                <FormField label="Provinsi" error={errors.province?.message} required>
                  <Input
                    {...register('province')}
                    placeholder="Provinsi"
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>

                <FormField label="Kode Pos" error={errors.postal_code?.message} required>
                  <Input
                    {...register('postal_code')}
                    placeholder="Kode pos"
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>
              </div>

              <FormField label="Pekerjaan" error={errors.occupation?.message} required>
                <Input
                  {...register('occupation')}
                  placeholder="Pekerjaan"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>
            </div>
          </FormSection>
        )

      // Add other cases for remaining steps...
      case 2: // Health Information
        return (
          <FormSection icon={Heart} title="Informasi Kesehatan" description="Data kesehatan untuk kelancaran ibadah">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  {...register('specific_disease')}
                  onCheckedChange={(checked) => {
                    setValue('specific_disease', checked as boolean, { shouldValidate: true })
                    setShowIllnessField(checked as boolean)
                  }}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="specific_disease" className="text-gray-700 cursor-pointer">
                  Memiliki penyakit khusus
                </Label>
              </div>

              {showIllnessField && (
                <FormField label="Detail penyakit" error={errors.illness?.message}>
                  <Textarea
                    {...register('illness')}
                    placeholder="Jelaskan penyakit yang Anda miliki"
                    rows={3}
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <Checkbox
                    {...register('special_needs')}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="special_needs" className="text-gray-700 cursor-pointer">
                    Membutuhkan penanganan khusus
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <Checkbox
                    {...register('wheelchair')}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="wheelchair" className="text-gray-700 cursor-pointer">
                    Membutuhkan kursi roda saat umroh
                  </Label>
                </div>
              </div>
            </div>
          </FormSection>
        )

      case 3: // Document Information
        return (
          <FormSection icon={FileText} title="Informasi Dokumen" description="Data dokumen identitas dan paspor">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="NIK (16 digit)" error={errors.nik_number?.message} required>
                  <Input
                    {...register('nik_number')}
                    placeholder="NIK 16 digit"
                    maxLength={16}
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>

                <FormField label="Nomor Paspor" error={errors.passport_number?.message} required>
                  <Input
                    {...register('passport_number')}
                    placeholder="Nomor paspor"
                    className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </FormField>

                <FormField label="Tanggal Terbit Paspor" error={errors.date_of_issue?.message} required>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watchDateOfIssue && 'text-muted-foreground'
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

                <FormField label="Tanggal Berakhir Paspor" error={errors.expiry_date?.message} required>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watchExpiryDate && 'text-muted-foreground'
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
              </div>

              <FormField label="Tempat Terbit Paspor" error={errors.place_of_issue?.message} required>
                <Input
                  {...register('place_of_issue')}
                  placeholder="Tempat terbit paspor"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>
            </div>
          </FormSection>
        )

      case 4: // Contact Information
        return (
          <FormSection icon={Phone} title="Informasi Kontak" description="Data kontak untuk komunikasi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nomor Telepon" error={errors.phone_number?.message} required>
                <Input
                  {...register('phone_number')}
                  placeholder="08123456789"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField label="Nomor WhatsApp" error={errors.whatsapp_number?.message} required>
                <Input
                  {...register('whatsapp_number')}
                  placeholder="08123456789"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message} required className="md:col-span-2">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="email@example.com"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>
            </div>
          </FormSection>
        )

      case 5: // Pilgrimage History
        return (
          <FormSection icon={Package} title="Riwayat Ibadah" description="Informasi riwayat ibadah sebelumnya">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  {...register('has_performed_umrah')}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="has_performed_umrah" className="text-gray-700 cursor-pointer">
                  Sudah pernah umroh
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  {...register('has_performed_hajj')}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="has_performed_hajj" className="text-gray-700 cursor-pointer">
                  Sudah pernah haji
                </Label>
              </div>
            </div>
          </FormSection>
        )

      case 6: // Emergency Contact
        return (
          <FormSection icon={AlertTriangle} title="Kontak Darurat" description="Informasi kontak untuk keadaan darurat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nama Kontak Darurat" error={errors.emergency_contact_name?.message} required>
                <Input
                  {...register('emergency_contact_name')}
                  placeholder="Nama kontak darurat"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>

              <FormField label="Hubungan" error={errors.relationship?.message} required>
                <Select onValueChange={(value) => setValue('relationship', value as any, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parents">Orang Tua</SelectItem>
                    <SelectItem value="spouse">Suami/Istri</SelectItem>
                    <SelectItem value="children">Anak</SelectItem>
                    <SelectItem value="sibling">Saudara</SelectItem>
                    <SelectItem value="relative">Kerabat</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Nomor Telepon Kontak Darurat" error={errors.emergency_contact_phone?.message} required className="md:col-span-2">
                <Input
                  {...register('emergency_contact_phone')}
                  placeholder="08123456789"
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
                />
              </FormField>
            </div>
          </FormSection>
        )

      case 7: // Package Information
        return (
          <FormSection icon={Package} title="Informasi Paket" description="Pemilihan paket dan metode pembayaran">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Status Pernikahan" error={errors.mariage_status?.message} required>
                  <Select onValueChange={(value) => setValue('mariage_status', value as any, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pernikahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Belum Menikah</SelectItem>
                      <SelectItem value="married">Menikah</SelectItem>
                      <SelectItem value="divorced">Janda/Duda</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Pilih Paket Umroh" error={errors.umrah_package?.message} required>
                  <Select onValueChange={(value) => setValue('umrah_package', value, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih paket umroh" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Metode Pembayaran" error={errors.payment_method?.message} required className="md:col-span-2">
                  <Select onValueChange={(value) => setValue('payment_method', value as any, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunas">Lunas</SelectItem>
                      <SelectItem value="60_percent">Cicilan 60% pertama</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Terms Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    {...register('terms_of_service')}
                    className="mt-1 data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="terms_of_service" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    Saya menyatakan bahwa data yang saya berikan adalah benar dan saya menyetujui syarat dan ketentuan yang berlaku. 
                    Saya memahami bahwa data ini akan digunakan untuk keperluan pendaftaran umroh dan komunikasi terkait.
                  </Label>
                </div>
                {errors.terms_of_service && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.terms_of_service.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>
        )

      default:
        return <div>Step content not implemented</div>
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h2>
            <p className="text-gray-600 mb-6">{submitMessage}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Daftar Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <FormProgress
              steps={FORM_STEPS}
              currentStep={currentStep}
              completedSteps={stepCompletion.completedSteps}
              stepsWithErrors={stepCompletion.stepsWithErrors}
            />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-3" />
                  Formulir Pendaftaran Umroh
                </h2>
                <p className="text-emerald-100 mt-2">
                  Langkah {currentStep + 1} dari {FORM_STEPS.length}: {FORM_STEPS[currentStep].title}
                </p>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Sebelumnya
                    </Button>

                    {currentStep === FORM_STEPS.length - 1 ? (
                      <Button
                        type="submit"
                        disabled={!isValid || submitStatus === 'submitting'}
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                      >
                        {submitStatus === 'submitting' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Kirim Pendaftaran
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                      >
                        Selanjutnya
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </form>

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{submitMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
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

  // Update illness field visibility
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
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Formulir Pendaftaran
            </h2>
            <p className="text-emerald-100 mt-2">
              Pastikan semua data yang Anda masukkan sudah benar
            </p>
          </div>

          <div className="p-6 md:p-8">
            <form
              onSubmit={handleSubmit(onSubmitHandler)}
              className="space-y-8"
            >
              {/* Personal Information Section */}
              <FormSection
                icon={User}
                title="Informasi Pribadi"
                description="Data pribadi sesuai identitas resmi"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Nama sesuai Paspor" error={errors.name?.message} required>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Masukkan nama lengkap"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
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
                          'w-full justify-start text-left font-normal transition-all duration-200 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 border-gray-300 hover:border-gray-400',
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

                  <FormField label="Jenis Kelamin" error={errors.gender?.message} required>
                    <Select
                      onValueChange={(value) => setValue('gender', value as 'male' | 'female')}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Laki-Laki</SelectItem>
                        <SelectItem value="female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Tempat Lahir" error={errors.place_of_birth?.message} required>
                    <Input
                      id="place_of_birth"
                      {...register('place_of_birth')}
                      placeholder="Masukkan tempat lahir"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <FormField label="Tanggal Lahir" error={errors.birth_date?.message} required>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal transition-all duration-200 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 border-gray-300 hover:border-gray-400',
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

                  <FormField label="Nama Ayah" error={errors.father_name?.message} required>
                    <Input
                      id="father_name"
                      {...register('father_name')}
                      placeholder="Masukkan nama ayah"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <FormField label="Nama Ibu" error={errors.mother_name?.message} required>
                    <Input
                      id="mother_name"
                      {...register('mother_name')}
                      placeholder="Masukkan nama ibu"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Address Information Section */}
              <FormSection
                icon={MapPin}
                title="Informasi Alamat"
                description="Alamat tempat tinggal saat ini"
              >
                <div className="space-y-6">
                  <FormField label="Alamat Lengkap" error={errors.address?.message} required>
                    <Textarea
                      id="address"
                      {...register('address')}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Kota" error={errors.city?.message} required>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="Masukkan kota"
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>

                    <FormField label="Provinsi" error={errors.province?.message} required>
                      <Input
                        id="province"
                        {...register('province')}
                        placeholder="Masukkan provinsi"
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>

                    <FormField label="Kode Pos" error={errors.postal_code?.message} required>
                      <Input
                        id="postal_code"
                        {...register('postal_code')}
                        placeholder="Masukkan kode pos"
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>
                  </div>

                  <FormField label="Pekerjaan" error={errors.occupation?.message} required>
                    <Input
                      id="occupation"
                      {...register('occupation')}
                      placeholder="Masukkan pekerjaan"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Health Information Section */}
              <FormSection
                icon={Heart}
                title="Informasi Kesehatan"
                description="Data kesehatan untuk kelancaran ibadah"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                    <Checkbox
                      id="specific_disease"
                      {...register('specific_disease')}
                      onCheckedChange={(checked) => {
                        setValue('specific_disease', checked as boolean)
                        setShowIllnessField(checked as boolean)
                      }}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="specific_disease" className="text-gray-700 cursor-pointer">
                      Memiliki penyakit khusus
                    </Label>
                  </div>

                  {showIllnessField && (
                    <FormField label="Detail penyakit" error={errors.illness?.message}>
                      <Textarea
                        id="illness"
                        {...register('illness')}
                        placeholder="Jelaskan penyakit yang Anda miliki"
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                      <Checkbox
                        id="special_needs"
                        {...register('special_needs')}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="special_needs" className="text-gray-700 cursor-pointer">
                        Membutuhkan penanganan khusus
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                      <Checkbox
                        id="wheelchair"
                        {...register('wheelchair')}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <Label htmlFor="wheelchair" className="text-gray-700 cursor-pointer">
                        Membutuhkan kursi roda saat umroh
                      </Label>
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Document Information Section */}
              <FormSection
                icon={FileText}
                title="Informasi Dokumen"
                description="Data dokumen identitas dan paspor"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="NIK (16 digit)" error={errors.nik_number?.message} required>
                      <Input
                        id="nik_number"
                        {...register('nik_number')}
                        placeholder="Masukkan NIK 16 digit"
                        maxLength={16}
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>

                    <FormField
                      label="Nomor Paspor"
                      error={errors.passport_number?.message}
                      required
                    >
                      <Input
                        id="passport_number"
                        {...register('passport_number')}
                        placeholder="Masukkan nomor paspor"
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                      />
                    </FormField>

                    <FormField
                      label="Tanggal Terbit Paspor"
                      error={errors.date_of_issue?.message}
                      required
                    >
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal transition-all duration-200 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 border-gray-300 hover:border-gray-400',
                            !watchDateOfIssue && 'text-muted-foreground',
                          )}
                          onClick={() => setShowIssueCalendar(!showIssueCalendar)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchDateOfIssue
                            ? format(watchDateOfIssue, 'dd/MM/yyyy')
                            : 'Pilih tanggal'}
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

                    <FormField
                      label="Tanggal Berakhir Paspor"
                      error={errors.expiry_date?.message}
                      required
                    >
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal transition-all duration-200 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500 border-gray-300 hover:border-gray-400',
                            !watchExpiryDate && 'text-muted-foreground',
                          )}
                          onClick={() => setShowExpiryCalendar(!showExpiryCalendar)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchExpiryDate
                            ? format(watchExpiryDate, 'dd/MM/yyyy')
                            : 'Pilih tanggal'}
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
                  </div>

                  <FormField
                    label="Tempat Terbit Paspor"
                    error={errors.place_of_issue?.message}
                    required
                  >
                    <Input
                      id="place_of_issue"
                      {...register('place_of_issue')}
                      placeholder="Masukkan tempat terbit paspor"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Contact Information Section */}
              <FormSection
                icon={Phone}
                title="Informasi Kontak"
                description="Data kontak untuk komunikasi"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Nomor Telepon" error={errors.phone_number?.message} required>
                    <Input
                      id="phone_number"
                      {...register('phone_number')}
                      placeholder="Masukkan nomor telepon"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <FormField
                    label="Nomor WhatsApp"
                    error={errors.whatsapp_number?.message}
                    required
                  >
                    <Input
                      id="whatsapp_number"
                      {...register('whatsapp_number')}
                      placeholder="Masukkan nomor WhatsApp"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <FormField label="Email" error={errors.email?.message} required>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Masukkan email"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Pilgrimage History Section */}
              <FormSection
                icon={Package}
                title="Riwayat Ibadah"
                description="Informasi riwayat ibadah sebelumnya"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                    <Checkbox
                      id="has_performed_umrah"
                      {...register('has_performed_umrah')}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="has_performed_umrah" className="text-gray-700 cursor-pointer">
                      Sudah pernah umroh
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                    <Checkbox
                      id="has_performed_hajj"
                      {...register('has_performed_hajj')}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="has_performed_hajj" className="text-gray-700 cursor-pointer">
                      Sudah pernah haji
                    </Label>
                  </div>
                </div>
              </FormSection>

              {/* Emergency Contact Section */}
              <FormSection
                icon={AlertTriangle}
                title="Kontak Darurat"
                description="Informasi kontak untuk keadaan darurat"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Nama Kontak Darurat"
                    error={errors.emergency_contact_name?.message}
                    required
                  >
                    <Input
                      id="emergency_contact_name"
                      {...register('emergency_contact_name')}
                      placeholder="Masukkan nama kontak darurat"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>

                  <FormField label="Hubungan" error={errors.relationship?.message} required>
                    <Select onValueChange={(value) => setValue('relationship', value as any)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Pilih hubungan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parents">Orang Tua</SelectItem>
                        <SelectItem value="spouse">Suami/Istri</SelectItem>
                        <SelectItem value="children">Anak</SelectItem>
                        <SelectItem value="sibling">Saudara</SelectItem>
                        <SelectItem value="relative">Kerabat</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Nomor Telepon Kontak Darurat"
                    error={errors.emergency_contact_phone?.message}
                    required
                  >
                    <Input
                      id="emergency_contact_phone"
                      {...register('emergency_contact_phone')}
                      placeholder="Masukkan nomor telepon kontak darurat"
                      className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Package Information Section */}
              <FormSection
                icon={Package}
                title="Informasi Paket"
                description="Pemilihan paket dan metode pembayaran"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Status Pernikahan"
                    error={errors.mariage_status?.message}
                    required
                  >
                    <Select onValueChange={(value) => setValue('mariage_status', value as any)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Pilih status pernikahan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Belum Menikah</SelectItem>
                        <SelectItem value="married">Menikah</SelectItem>
                        <SelectItem value="divorced">Janda/Duda</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Pilih Paket Umroh"
                    error={errors.umrah_package?.message}
                    required
                  >
                    <Select onValueChange={(value) => setValue('umrah_package', value)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Pilih paket umroh" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Metode Pembayaran"
                    error={errors.payment_method?.message}
                    required
                  >
                    <Select onValueChange={(value) => setValue('payment_method', value as any)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent border-gray-300 hover:border-gray-400">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lunas">Lunas</SelectItem>
                        <SelectItem value="60_percent">Cicilan 60% pertama</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormSection>

              {/* Terms Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms_of_service"
                    {...register('terms_of_service')}
                    className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label
                    htmlFor="terms_of_service"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    Saya menyatakan bahwa data yang saya berikan adalah benar dan saya menyetujui
                    syarat dan ketentuan yang berlaku. Saya understand bahwa data ini akan digunakan
                    untuk keperluan pendaftaran umroh dan komunikasi terkait.
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
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 Rehla Tours. Semua data akan dijaga kerahasiaannya.</p>
        </div>
      </div>
    </div>
  )
}
