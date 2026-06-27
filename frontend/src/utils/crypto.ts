import { apiFetch } from "@/lib/api";

let cachedPublicKeyPem: string | null = null;

async function fetchPublicKey(): Promise<string> {
  if (cachedPublicKeyPem) return cachedPublicKeyPem;
  
  try {
    const res = await apiFetch<{ data?: { public_key: string } }>("/api/auth/crypto-key");
    if (!res.data || !res.data.public_key) {
      throw new Error("No public key in response");
    }
    cachedPublicKeyPem = res.data.public_key;
    return cachedPublicKeyPem;
  } catch (err) {
    console.error("Failed to fetch public encryption key:", err);
    throw new Error("Failed to retrieve public encryption key from server");
  }
}

async function importPublicKey(pemKey: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pemKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
    
  const binaryDerString = window.atob(pemContents);
  const binaryLen = binaryDerString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
    bytes[i] = binaryDerString.charCodeAt(i);
  }
  
  return await window.crypto.subtle.importKey(
    "spki",
    bytes.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

/**
 * Encrypts a plaintext string (e.g. password) using RSA-OAEP with SHA-256.
 * The result is returned as a base64 string prefixed with 'enc:'.
 */
export async function encryptSensitiveField(value: string): Promise<string> {
  if (!value) return value;
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Fallback if running outside of a browser context or in an unsecure context
    return value;
  }
  
  try {
    const pemKey = await fetchPublicKey();
    const publicKey = await importPublicKey(pemKey);
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
    );
    
    // Convert array buffer to base64
    const bytes = new Uint8Array(encryptedBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return "enc:" + window.btoa(binary);
  } catch (err) {
    console.error("Encryption of sensitive field failed:", err);
    throw new Error("Failed to secure sensitive information before transmission.");
  }
}
