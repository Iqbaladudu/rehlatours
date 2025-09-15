'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, ArrowRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormStep {
  id: string
  title: string
  description: string
  fields: string[]
}

interface FormProgressProps {
  steps: FormStep[]
  currentStep: number
  completedSteps: Set<number>
  stepsWithErrors: Set<number>
  className?: string
}

export function FormProgress({
  steps,
  currentStep,
  completedSteps,
  stepsWithErrors,
  className,
}: FormProgressProps) {
  const completionPercentage = Math.round((completedSteps.size / steps.length) * 100)

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-gray-800">Progress Pengisian</div>
            <div className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
              {completionPercentage}% Selesai
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Langkah {currentStep + 1} dari {steps.length}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-3">
          <Progress value={completionPercentage} className="h-3 bg-gray-200" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Mulai</span>
            <span>Selesai</span>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="text-lg font-semibold text-gray-800 mb-4">Tahapan Formulir</div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index)
            const isCurrent = currentStep === index
            const hasError = stepsWithErrors.has(index)
            const isPast = index < currentStep

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-start space-x-4 p-4 rounded-lg border-2 transition-all duration-300',
                  {
                    'bg-emerald-50 border-emerald-200': isCompleted && !hasError,
                    'bg-red-50 border-red-200': hasError,
                    'bg-blue-50 border-blue-200 shadow-md': isCurrent && !hasError,
                    'bg-gray-50 border-gray-200':
                      !isCurrent && !isCompleted && !hasError && !isPast,
                    'bg-gray-100 border-gray-300': isPast && !isCompleted && !hasError,
                  },
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {hasError ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                        {
                          'bg-blue-500 border-blue-500 text-white': isCurrent,
                          'bg-white border-gray-300 text-gray-500': !isCurrent,
                        },
                      )}
                    >
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn('text-base font-semibold', {
                      'text-emerald-700': isCompleted && !hasError,
                      'text-red-700': hasError,
                      'text-blue-700': isCurrent && !hasError,
                      'text-gray-900': !isCurrent && !isCompleted && !hasError,
                    })}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn('text-sm mt-1', {
                      'text-emerald-600': isCompleted && !hasError,
                      'text-red-600': hasError,
                      'text-blue-600': isCurrent && !hasError,
                      'text-gray-600': !isCurrent && !isCompleted && !hasError,
                    })}
                  >
                    {hasError ? 'Ada kesalahan yang perlu diperbaiki' : step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface FieldProgressProps {
  fieldName: string
  isCompleted: boolean
  isRequired: boolean
  hasError?: boolean
}

export function FieldProgress({
  fieldName,
  isCompleted,
  isRequired,
  hasError = false,
}: FieldProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {hasError ? (
        <AlertCircle className="w-4 h-4 text-red-500" />
      ) : isCompleted ? (
        <CheckCircle className="w-4 h-4 text-emerald-500" />
      ) : (
        <Circle className="w-4 h-4 text-gray-400" />
      )}
      <span
        className={cn('text-xs', {
          'text-emerald-600': isCompleted && !hasError,
          'text-red-600': hasError,
          'text-gray-700': !isCompleted && !hasError && isRequired,
          'text-gray-500': !isCompleted && !hasError && !isRequired,
        })}
      >
        {fieldName}
        {isRequired && !isCompleted && <span className="text-red-500 ml-1">*</span>}
      </span>
    </div>
  )
}

// Form sections configuration
export const FORM_STEPS: FormStep[] = [
  {
    id: 'personal',
    title: 'Informasi Pribadi',
    description: 'Data pribadi sesuai identitas resmi',
    fields: [
      'name',
      'register_date',
      'gender',
      'place_of_birth',
      'birth_date',
      'father_name',
      'mother_name',
    ],
  },
  {
    id: 'address',
    title: 'Informasi Alamat',
    description: 'Alamat tempat tinggal saat ini',
    fields: ['address', 'city', 'province', 'postal_code', 'occupation'],
  },
  {
    id: 'health',
    title: 'Informasi Kesehatan',
    description: 'Data kesehatan untuk kelancaran ibadah',
    fields: ['specific_disease', 'illness', 'special_needs', 'wheelchair'],
  },
  {
    id: 'documents',
    title: 'Informasi Dokumen',
    description: 'Data dokumen identitas dan paspor',
    fields: ['nik_number', 'passport_number', 'date_of_issue', 'expiry_date', 'place_of_issue'],
  },
  {
    id: 'contact',
    title: 'Informasi Kontak',
    description: 'Data kontak untuk komunikasi',
    fields: ['phone_number', 'whatsapp_number', 'email'],
  },
  {
    id: 'pilgrimage',
    title: 'Riwayat Ibadah',
    description: 'Informasi riwayat ibadah sebelumnya',
    fields: ['has_performed_umrah', 'has_performed_hajj'],
  },
  {
    id: 'emergency',
    title: 'Kontak Darurat',
    description: 'Informasi kontak untuk keadaan darurat',
    fields: ['emergency_contact_name', 'relationship', 'emergency_contact_phone'],
  },
  {
    id: 'package',
    title: 'Informasi Paket',
    description: 'Pemilihan paket dan metode pembayaran',
    fields: ['mariage_status', 'umrah_package', 'payment_method', 'terms_of_service'],
  },
]
