import type { ContactRequest, ContactResponse } from "@/types";

const API_URL = import.meta.env.VITE_NOVUS_API_URL as string | undefined;

/**
 * Submits contact form to production API.
 * No demo fallback — R-001 mitigation per NADF plan.
 */
export async function submitContact(payload: ContactRequest): Promise<ContactResponse> {
  if (!API_URL) {
    return {
      ok: false,
      message:
        "Servicio de contacto no disponible. Configura VITE_NOVUS_API_URL o espera a que la API DEV esté desplegada.",
    };
  }

  try {
    const res = await fetch(`${API_URL.replace(/\/$/, "")}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as ContactResponse;

    if (!res.ok) {
      return {
        ok: false,
        message: data.message ?? `Error del servidor (${res.status}).`,
      };
    }

    return data;
  } catch {
    return {
      ok: false,
      message: "Error de red. Verifica tu conexión e intenta de nuevo.",
    };
  }
}
