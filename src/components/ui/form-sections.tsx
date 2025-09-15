'use client'

import React from 'react'
import { ChevronDown, ChevronRight, User, MapPin, Heart, FileText, Phone, Users, CreditCard } from 'lucide-react'

interface FormSectionProps {
  title: string
  description?: string
  icon: React.ReactNode
  children: React.ReactNode
  isCompleted?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  completedFields?: number
  totalFields?: number
}

export function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  isCompleted = false, 
  isExpanded = true, 
  onToggle,
  completedFields = 0,
  totalFields = 0
}: FormSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Section Header */}
      <div 
        className={`p-4 cursor-pointer transition-colors duration-200 ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 hover:bg-gray-100'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                {title}
                {isCompleted && (
                  <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                    Selesai
                  </span>
                )}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {totalFields > 0 && (
              <div className="text-xs text-gray-500">
                {completedFields}/{totalFields}
              </div>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface FormSectionGroupProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function FormSectionGroup({ children, title, description }: FormSectionGroupProps) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

// Predefined section configurations
export const formSections = [
  {
    id: 'personal',
    title: 'Data Pribadi',
    description: 'Informasi identitas diri Anda',
    icon: <User className="w-5 h-5" />,
    fields: [
      'name', 'register_date', 'gender', 'place_of_birth', 'birth_date',
      'father_name', 'mother_name', 'mariage_status', 'occupation'
    ]
  },
  {
    id: 'address',
    title: 'Data Alamat',
    description: 'Informasi tempat tinggal Anda',
    icon: <MapPin className="w-5 h-5" />,
    fields: [
      'address', 'city', 'province', 'postal_code'
    ]
  },
  {
    id: 'health',
    title: 'Data Kesehatan',
    description: 'Informasi kondisi kesehatan Anda',
    icon: <Heart className="w-5 h-5" />,
    fields: [
      'specific_disease', 'illness', 'special_needs', 'wheelchair'
    ]
  },
  {
    id: 'documents',
    title: 'Data Dokumen',
    description: 'Informasi dokumen penting Anda',
    icon: <FileText className="w-5 h-5" />,
    fields: [
      'nik_number', 'passport_number', 'date_of_issue', 'expiry_date', 'place_of_issue'
    ]
  },
  {
    id: 'contact',
    title: 'Data Kontak',
    description: 'Informasi cara menghubungi Anda',
    icon: <Phone className="w-5 h-5" />,
    fields: [
      'phone_number', 'whatsapp_number', 'email'
    ]
  },
  {
    id: 'pilgrimage',
    title: 'Riwayat Ibadah',
    description: 'Informasi pengalaman ibadah Anda',
    icon: <Heart className="w-5 h-5" />,
    fields: [
      'has_performed_umrah', 'has_performed_hajj'
    ]
  },
  {
    id: 'emergency',
    title: 'Kontak Darurat',
    description: 'Informasi kontak darurat Anda',
    icon: <Users className="w-5 h-5" />,
    fields: [
      'emergency_contact_name', 'relationship', 'emergency_contact_phone'
    ]
  },
  {
    id: 'package',
    title: 'Paket & Pembayaran',
    description: 'Pilihan paket dan metode pembayaran',
    icon: <CreditCard className="w-5 h-5" />,
    fields: [
      'umrah_package', 'payment_method', 'terms_of_service'
    ]
  }
]