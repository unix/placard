import { Skeleton } from '@/components/ui/skeleton'

interface PreviewCardSkeletonProps {
  readonly label: string
}

export const PreviewCardSkeleton = ({ label }: PreviewCardSkeletonProps) => (
  <Skeleton
    aria-label={label}
    className="preview-card-skeleton h-full w-full animate-none rounded-none"
    role="status"
  />
)
