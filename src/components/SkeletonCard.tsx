export default function SkeletonCard() {
  return (
    <div className="border rounded-lg bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2.5">
        <div className="space-y-1.5">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded-full w-16" />
          <div className="h-3 bg-muted rounded w-14" />
        </div>
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  )
}
