import React from 'react'
import { cn } from '@/utils/cn'

export interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const skeletonAnimations = {
  pulse: 'animate-pulse',
  wave: 'animate-wave',
  none: '',
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  const animationClass = skeletonAnimations[animation]

  const variantClasses = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClass,
        className
      )}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  )
}

// Convenience components for common skeleton patterns
export const TextSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (
  props
) => <LoadingSkeleton {...props} variant="text" />

export const CircularSkeleton: React.FC<
  Omit<LoadingSkeletonProps, 'variant'>
> = (props) => <LoadingSkeleton {...props} variant="circular" />

export const RectangularSkeleton: React.FC<
  Omit<LoadingSkeletonProps, 'variant'>
> = (props) => <LoadingSkeleton {...props} variant="rectangular" />

// Compound skeleton components for common layouts
export interface CardSkeletonProps {
  showAvatar?: boolean
  showActions?: boolean
  lines?: number
  className?: string
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showAvatar = false,
  showActions = false,
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('p-4 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <CircularSkeleton width={40} height={40} />
          <div className="space-y-2">
            <TextSkeleton width={120} height={16} />
            <TextSkeleton width={80} height={14} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <TextSkeleton width="100%" height={20} />
        {Array.from({ length: lines }).map((_, index) => (
          <TextSkeleton
            key={index}
            width={index === lines - 1 ? '75%' : '100%'}
            height={16}
          />
        ))}
      </div>

      {showActions && (
        <div className="flex space-x-2">
          <RectangularSkeleton width={80} height={32} />
          <RectangularSkeleton width={80} height={32} />
        </div>
      )}
    </div>
  )
}

export interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = false,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          {showAvatar && <CircularSkeleton width={32} height={32} />}
          <div className="flex-1 space-y-2">
            <TextSkeleton width="60%" height={16} />
            <TextSkeleton width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  )
}

export interface TableSkeletonProps {
  rows?: number
  cols?: number
  showHeader?: boolean
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 4,
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {showHeader && (
        <div className="flex space-x-4 pb-2 border-b">
          {Array.from({ length: cols }).map((_, index) => (
            <TextSkeleton key={index} width={100} height={16} />
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <TextSkeleton key={colIndex} width={100} height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}
