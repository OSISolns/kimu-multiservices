// Skeleton loading components for KIMU Transport & Multiservices

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

/**
 * Basic skeleton element
 */
export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
export function SkeletonText({ lines = 3, className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          height="h-4" 
          width={index === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton
 */
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton height="h-12" width="w-12" className="rounded-full" />
        <div className="flex-1">
          <Skeleton height="h-4" width="w-3/4" className="mb-2" />
          <Skeleton height="h-3" width="w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex justify-between items-center mt-4">
        <Skeleton height="h-8" width="w-20" className="rounded-lg" />
        <Skeleton height="h-8" width="w-24" className="rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Table skeleton
 */
export function SkeletonTable({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton 
              key={index} 
              height="h-4" 
              width={index === 0 ? 'w-32' : 'w-24'} 
            />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  height="h-4" 
                  width={colIndex === 0 ? 'w-32' : 'w-24'} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton
 */
export function SkeletonForm({ fields = 6, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            <Skeleton height="h-4" width="w-24" className="mb-2" />
            <Skeleton height="h-10" width="w-full" className="rounded-lg" />
          </div>
        ))}
        <div className="flex space-x-4 pt-4">
          <Skeleton height="h-10" width="w-24" className="rounded-lg" />
          <Skeleton height="h-10" width="w-24" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  return (
    <Skeleton 
      height={sizeClasses[size]} 
      width={sizeClasses[size]} 
      className={`rounded-full ${className}`}
    />
  );
}

/**
 * Button skeleton
 */
export function SkeletonButton({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };
  
  return (
    <Skeleton 
      height={sizeClasses[size].split(' ')[0]} 
      width="w-24" 
      className={`rounded-lg ${className}`}
    />
  );
}

/**
 * Image skeleton
 */
export function SkeletonImage({ aspectRatio = 'aspect-square', className = '' }: { aspectRatio?: string; className?: string }) {
  return (
    <div className={`${aspectRatio} bg-gray-200 rounded-lg animate-pulse ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
    </div>
  );
}

/**
 * List skeleton
 */
export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton height="h-4" width="w-4" className="rounded" />
          <Skeleton height="h-4" width="w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function SkeletonStatsCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton height="h-4" width="w-24" />
        <Skeleton height="h-8" width="w-8" className="rounded-lg" />
      </div>
      <Skeleton height="h-8" width="w-20" className="mb-2" />
      <Skeleton height="h-3" width="w-32" />
    </div>
  );
}

/**
 * Chart skeleton
 */
export function SkeletonChart({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <Skeleton height="h-6" width="w-48" className="mb-6" />
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
