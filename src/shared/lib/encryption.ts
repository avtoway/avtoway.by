import "server-only";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY ?? "avtoway-dev-encryption-key-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(value: string): string {
  if (!value.startsWith("enc:v1:")) return value;
  const parts = value.split(":");
  const ivB64 = parts[2];
  const tagB64 = parts[3];
  const dataB64 = parts[4];
  if (!ivB64 || !tagB64 || !dataB64) return value;
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncrypted(value: string): boolean {
  return value.startsWith("enc:v1:");
}
