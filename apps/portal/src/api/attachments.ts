import { ApiError, apiPost } from "./client";

export interface UploadedAttachment {
  key: string;
  name: string;
  contentType: string;
  size: number;
  kind: "image" | "text" | "word" | "pdf";
}

/** Tipo MIME por extensión (los navegadores suelen dejar vacío el de .md). */
const BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  md: "text/markdown",
  markdown: "text/markdown",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

export const ACCEPT = ".png,.jpg,.jpeg,.webp,.gif,.md,.markdown,.txt,.docx,.pdf";
export const MAX_FILES = 5;
export const MAX_BYTES = 10 * 1024 * 1024;

export function contentTypeOf(file: File): string | null {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return BY_EXT[ext] ?? null;
}

/** Valida en el navegador antes de subir (el backend vuelve a validar). */
export function validateFile(file: File, current: number): string | null {
  if (current >= MAX_FILES) return `Puedes adjuntar hasta ${MAX_FILES} archivos.`;
  if (!contentTypeOf(file)) return `«${file.name}» no es un tipo permitido: imágenes, .md, .txt, Word (.docx) o PDF.`;
  if (file.size > MAX_BYTES) return `«${file.name}» pesa más de 10 MB.`;
  if (file.size === 0) return `«${file.name}» está vacío.`;
  return null;
}

/** Sube un adjunto directo a S3 con una URL firmada por el backend. */
export async function uploadAttachment(file: File): Promise<UploadedAttachment> {
  const contentType = contentTypeOf(file);
  if (!contentType) throw new ApiError(400, "INVALID_TYPE", "Tipo de archivo no permitido.");
  const { key, uploadUrl, kind } = await apiPost<{ key: string; uploadUrl: string; kind: UploadedAttachment["kind"] }>("/api/v1/portal/attachments", {
    name: file.name,
    contentType,
    size: file.size,
  });
  const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
  if (!put.ok) throw new ApiError(put.status, "UPLOAD_FAILED", `No se pudo subir «${file.name}».`);
  return { key, name: file.name, contentType, size: file.size, kind };
}
