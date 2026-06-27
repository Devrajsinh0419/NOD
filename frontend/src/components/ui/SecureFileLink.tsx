"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  downloadSecureFile,
  isPrivateFileUrl,
  getMediaUrl,
} from "@/lib/api";

interface SecureFileLinkProps {
  filePath: string;
  label?: string;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
}

export function SecureFileLink({
  filePath,
  label = "Download",
  className = "",
  iconClassName = "w-3 h-3",
  showIcon = true,
}: SecureFileLinkProps) {
  const [loading, setLoading] = useState(false);

  if (!filePath) return null;

  if (!isPrivateFileUrl(filePath)) {
    return (
      <a
        href={getMediaUrl(filePath)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {showIcon ? <Download className={iconClassName} /> : label}
      </a>
    );
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await downloadSecureFile(filePath);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={className}
      title={label}
    >
      {showIcon ? <Download className={iconClassName} /> : loading ? "..." : label}
    </button>
  );
}
