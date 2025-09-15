'use client'

import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationIndicatorProps {
  isValid?: boolean
  isDirty?: boolean
  isLoading?: boolean
  error?: string
  required?: boolean
  label?: string
  info?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ValidationIndicator({
  isValid,
  isDirty,
  isLoading,
  error,
  required,
  label,
  info,
  size = 'sm',
}: ValidationIndicatorProps) {
  const getStatus = () => {
    if (isLoading) return 'loading'
    if (error) return 'error'
    if (isValid && isDirty) return 'success'
    if (isDirty && !isValid && !error) return 'warning'
    if (info && !isDirty) return 'info'
    return null
  }

  const status = getStatus()

  if (!status) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const statusConfig = {
    loading: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: 'Memvalidasi...',
    },
    success: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      message: `${label || 'Data'} valid`,
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: error,
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      message: required
        ? `${label || 'Field ini'} wajib diisi`
        : `${label || 'Data'} belum lengkap`,
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: info,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border transition-all duration-200',
        config.borderColor,
        config.bgColor,
        sizeClasses[size],
      )}
    >
      <Icon
        className={cn(
          config.color,
          iconSizes[size],
          'flex-shrink-0 mt-0.5',
          status === 'loading' ? 'animate-spin' : '',
        )}
      />
      <span className={cn('font-medium leading-relaxed', config.color)}>{config.message}</span>
    </div>
  )
}

interface FieldWrapperProps {
  children: React.ReactNode
  label: string
  required?: boolean
  description?: string
  error?: string
  isValid?: boolean
  isDirty?: boolean
  isLoading?: boolean
  info?: string
  className?: string
}

export function FieldWrapper({
  children,
  label,
  required,
  description,
  error,
  isValid,
  isDirty,
  isLoading,
  info,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {label}
          {required && (
            <span className="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded-full font-semibold">
              Wajib
            </span>
          )}
        </label>
        {isDirty && !isLoading && (
          <div className="flex items-center gap-1">
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : error ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
        )}
      </div>

      {description && <p className="text-xs text-gray-600 leading-relaxed">{description}</p>}

      {children}

      <ValidationIndicator
        isValid={isValid}
        isDirty={isDirty}
        isLoading={isLoading}
        error={error}
        required={required}
        label={label}
        info={info}
        size="sm"
      />
    </div>
  )
}

// Enhanced validation for real-time feedback
interface RealTimeValidationProps {
  value: any
  fieldName: string
  schema?: any
  touched?: boolean
  className?: string
}

export function RealTimeValidation({
  value,
  fieldName,
  schema,
  touched = false,
  className,
}: RealTimeValidationProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  const validateField = () => {
    if (!schema || !hasValue) return { isValid: true, error: null }

    try {
      const fieldSchema = schema.shape[fieldName]
      if (!fieldSchema) return { isValid: true, error: null }

      fieldSchema.parse(value)
      return { isValid: true, error: null }
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid value'
      return { isValid: false, error: errorMessage }
    }
  }

  const { isValid, error } = validateField()

  if (!touched && !hasValue) return null

  return (
    <ValidationIndicator
      isValid={isValid}
      isDirty={hasValue}
      error={error}
      label={fieldName}
      size="sm"
    />
  )
}
