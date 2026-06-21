"use client"

import { useRef, useState } from "react"
import { uploadService } from "@/services/upload.service"

interface FileUploadZoneProps {
  label: string
  category: string
  multiple?: boolean
  accept?: string
  onUpload: (urls: string[]) => void
  existingUrls?: string[]
}

export default function FileUploadZone({
  label,
  category,
  multiple = false,
  accept = ".png,.jpg,.jpeg,.pdf",
  onUpload,
  existingUrls = [],
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [files, setFiles] = useState<{ name: string; url: string }[]>(
    existingUrls.map((url) => ({ name: url.split("/").pop() || "file", url }))
  )

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setError("")
    setUploading(true)

    try {
      const urls = await uploadService.uploadFiles(fileList, category)
      const newFiles = Array.from(fileList).map((f, i) => ({
        name: f.name,
        url: urls[i],
      }))

      const updated = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updated)
      onUpload(updated.map((f) => f.url))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onUpload(updated.map((f) => f.url))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.25em] text-white/35 mb-2">
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer
          transition-all duration-300
          ${dragOver
            ? "border-[#C9A96E]/40 bg-white/[0.06]"
            : "border-black/40 bg-white/[0.02] hover:border-black/80 hover:bg-white/[0.04]"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/50 rounded-full animate-spin" />
            <p className="text-xs text-[#6B5A42]">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-xs text-[#6B5A42]">
              {multiple ? "Drop files here or click to browse" : "Drop file here or click to browse"}
            </p>
            <p className="text-[10px] text-[#5A4A35]">PNG, JPG, or PDF • Max 20 MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-[10px] text-red-400/60">{error}</p>
      )}

      {/* Uploaded file list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#C9A96E]/8 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-3.5 h-3.5 text-[#6B5A42] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs text-[#8B7355] truncate">{f.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                className="text-[#6B5A42] hover:text-red-400/60 transition-colors ml-2 shrink-0"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
