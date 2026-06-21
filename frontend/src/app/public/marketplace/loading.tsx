export default function MarketplaceLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/60 rounded-full animate-spin" />
        <p className="text-sm text-[#6B5A42] tracking-wide">Loading marketplace…</p>
      </div>
    </div>
  )
}
