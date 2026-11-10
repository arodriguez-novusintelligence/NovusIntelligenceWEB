import { useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ShieldCheck, ShieldPlus } from "lucide-react";
import { setUpTOTP, updateMFAPreference, verifyTOTPSetup } from "aws-amplify/auth";
import type { Me } from "@/api/client";
import { useAuth } from "@/auth/AuthProvider";
import { authErrorMessage } from "@/auth/steps";
import { ROLE_LABELS } from "@/lib/navigation";

export function SecurityPage({ me, mfaEnabled }: { me: Me; mfaEnabled: boolean }) {
  const { refresh } = useAuth();
  const [setup, setSetup] = useState<{ uri: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const details = await setUpTOTP();
      setSetup({ uri: details.getSetupUri("NADF Novus", me.user.email).toString(), secret: details.sharedSecret });
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyTOTPSetup({ code: code.trim() });
      await updateMFAPreference({ totp: "PREFERRED" });
      setSetup(null);
      setCode("");
      await refresh();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Seguridad</p>
        <h1 className="text-3xl font-semibold">Tu cuenta</h1>
      </section>

      <section className="glass grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Nombre</p>
          <p className="mt-1">{me.user.name ?? "Sin nombre"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Correo</p>
          <p className="mt-1 break-all">{me.user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Empresa</p>
          <p className="mt-1">{me.company.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Roles</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {me.user.roles.map((r) => (
              <span key={r} className="chip">
                {ROLE_LABELS[r] ?? r}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="glass space-y-4 p-5" aria-labelledby="mfa-title">
        <div className="flex items-start gap-3">
          {mfaEnabled ? <ShieldCheck className="h-6 w-6 shrink-0 text-good" aria-hidden="true" /> : <ShieldPlus className="h-6 w-6 shrink-0 text-warn" aria-hidden="true" />}
          <div>
            <h2 id="mfa-title" className="text-lg font-semibold">
              Verificación en dos pasos
            </h2>
            <p className="text-sm text-muted-foreground">
              {mfaEnabled
                ? "Activa. NADF te pedirá un código de tu app de autenticación al ingresar."
                : me.user.mfaRequired
                  ? "Tu rol la necesita: las aprobaciones y despliegues a producción la exigirán."
                  : "Recomendada para proteger tu cuenta."}
            </p>
          </div>
        </div>

        {!mfaEnabled && !setup && (
          <button type="button" className="btn-primary" onClick={() => void start()} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Activar verificación en dos pasos
          </button>
        )}

        {setup && (
          <form onSubmit={verify} className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="flex justify-center rounded-xl bg-white p-4">
              <QRCodeSVG value={setup.uri} size={160} aria-label="Código QR para tu app de autenticación" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Escanea el código con tu app de autenticación. Si no puedes escanearlo, escribe esta clave:
              </p>
              <p className="break-all rounded-lg bg-white/[0.05] px-3 py-2 font-mono text-sm">{setup.secret}</p>
              <label htmlFor="mfa-code" className="block text-sm font-medium">
                Código de 6 dígitos
              </label>
              <input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="field max-w-[12rem] text-center font-mono text-lg tracking-[0.4em]"
              />
              <button type="submit" className="btn-primary" disabled={busy || !/^\d{6}$/.test(code)}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Verificar y activar
              </button>
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
