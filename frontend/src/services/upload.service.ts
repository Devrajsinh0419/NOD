const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} exceeds 20 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name} — unsupported format. Use PNG, JPG, or PDF.`;
  }
  return null;
}

export const uploadService = {
  /**
   * Upload a single file. Returns the uploaded file URL.
   * @param file     - File to upload
   * @param category - Contextual label (e.g. "site_plan", "floor_plan")
   */
  async uploadFile(file: File, category: string): Promise<string> {
    const error = validateFile(file);
    if (error) throw new Error(error);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("nod_token") : null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Upload failed");
    }

    return json.data?.url || json.url;
  },

  /**
   * Upload multiple files. Returns array of uploaded file URLs.
   */
  async uploadFiles(files: FileList | File[], category: string): Promise<string[]> {
    const fileArray = Array.from(files);

    // Validate all files first
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) throw new Error(error);
    }

    const urls = await Promise.all(
      fileArray.map((file) => this.uploadFile(file, category))
    );

    return urls;
  },

  /** Validate a file without uploading (for UI feedback) */
  validate(file: File): string | null {
    return validateFile(file);
  },

  /** Max file size in bytes */
  MAX_FILE_SIZE,
};
