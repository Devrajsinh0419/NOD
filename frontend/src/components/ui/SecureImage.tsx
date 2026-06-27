"use client";

import { useEffect, useState } from "react";
import {
  fetchSecureFile,
  isPrivateFileUrl,
  getMediaUrl,
} from "@/lib/api";

interface SecureImageProps {
  filePath: string;
  alt?: string;
  className?: string;
}

export function SecureImage({ filePath, alt = "", className = "" }: SecureImageProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!filePath) return;

    if (!isPrivateFileUrl(filePath)) {
      setSrc(getMediaUrl(filePath));
      return;
    }

    let blobUrl = "";
    let cancelled = false;

    fetchSecureFile(filePath, true)
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [filePath]);

  if (!src) return null;

  return <img src={src} alt={alt} className={className} />;
}
