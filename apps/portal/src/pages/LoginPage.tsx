import { useState, type FormEvent, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { authErrorMessage, isStrongPassword, type AuthStep } from "@/auth/steps";
import { AgentAvatar } from "@/components/AgentAvatar";
import { NadfMark } from "@/components/NadfMark";
import { NeuralBackdrop } from "@/components/NeuralBackdrop";
import { cn } from "@/lib/cn";

function PasswordRules({ value }: { value: string }) {
  const rules = [
    { ok: value.length >= 12, label: "12 caracteres o más" },
    { ok: /[A-Z]/.test(value) && /[a-z]/.test(value), label: "Mayúsculas y minúsculas" },
    { ok: /\d/.test(value), label: "Un número" },
    { ok: /[^A-Za-z0-9]/.test(value), label: "Un símbolo" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-1.5 text-xs">
      {rules.map((r) => (
        <li key={r.label} className={cn("flex items-center gap-1.5", r.ok ? "text-good" : "text-muted-foreground")}>
          <Check className={cn("h-3.5 w-3.5", r.ok ? "opacity-100" : "opacity-30")} aria-hidden="true" />
          {r.label}
        </li>
      ))}
    </ul>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      {children}
    </div>
  );
}

const TITLES: Record<AuthStep, { title: string; subtitle: string }> = {
  credentials: { title: "Ingresa a NADF", subtitle: "Usa el correo con el que te invitaron." },
  newPassword: { title: "Crea tu contraseña", subtitle: "Es tu primer ingreso: reemplaza la contraseña temporal." },
  totp: { title: "Verificación en dos pasos", subtitle: "Escribe el código de 6 dígitos de tu app de autenticación." },
  totpSetup: { title: "Activa la verificación en dos pasos", subtitle: "Escanea el código con Google Authenticator, Microsoft Authenticator o similar." },
  resetCode: { title: "Restablece tu contraseña", subtitle: "Te enviamos un código a tu correo." },
  done: { title: "Ingresando…", subtitle: "" },
  unsupported: { title: "No pudimos continuar", subtitle: "Este método de acceso no está habilitado. Contacta al administrador de tu empresa." },
};

export function LoginPage({ step, totpUri, email: knownEmail }: { step: AuthStep; totpUri?: string; email?: string }) {
  const auth = useAuth();
  const [email, setEmail] = useState(knownEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setPassword("");
      setConfirm("");
      setCode("");
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step === "credentials" && forgot) {
      void run(async () => {
        await auth.requestReset(email);
        setForgot(false);
      });
      return;
    }
    switch (step) {
      case "credentials":
        void run(() => auth.startSignIn(email, password));
        break;
      case "newPassword":
        if (password !== confirm) {
          setError("Las contraseñas no coinciden.");
          return;
        }
        void run(() => auth.answerChallenge(password));
        break;
      case "totp":
      case "totpSetup":
        void run(() => auth.answerChallenge(code.trim()));
        break;
      case "resetCode":
        if (password !== confirm) {
          setError("Las contraseñas no coinciden.");
          return;
        }
        void run(() => auth.completeReset(email, code.trim(), password));
        break;
      default:
        break;
    }
  }

  const heading = forgot ? { title: "Recupera tu acceso", subtitle: "Te enviaremos un código a tu correo." } : TITLES[step];
  const needsStrong = step === "newPassword" || step === "resetCode";
  const submitDisabled =
    busy || (needsStrong && (!isStrongPassword(password) || !confirm)) || ((step === "totp" || step === "totpSetup") && !/^\d{6}$/.test(code.trim()));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeuralBackdrop />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <section className="hidden space-y-8 lg:block">
          <div className="flex items-center gap-4">
            <NadfMark size={56} />
            <div>
              <p className="font-display text-2xl font-semibold">NADF</p>
              <p className="text-sm text-muted-foreground">Novus AI Development Framework</p>
            </div>
          </div>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight">
            Desarrollo con <span className="ai-gradient-text">inteligencia artificial</span>, organizado y bajo control.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Pide lo que necesitas en lenguaje natural. Los agentes de NADF lo analizan, lo desarrollan en tus repositorios, lo prueban y te
            entregan un informe. Nada llega a producción sin la aprobación de una persona.
          </p>
          <div className="glass grid max-w-md grid-cols-2 gap-4 p-5">
            <AgentAvatar name="Analista" initials="AN" state="thinking" detail="Entiende la solicitud" />
            <AgentAvatar name="Desarrollador" initials="DV" state="running" detail="Escribe el código" />
            <AgentAvatar name="QA" initials="QA" state="idle" detail="Prueba y evidencia" />
            <AgentAvatar name="Release" initials="RL" state="waiting" detail="Espera aprobación" />
          </div>
        </section>

        <section className="glass-strong ai-border mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <NadfMark size={40} />
            <div>
              <p className="font-display text-lg font-semibold">NADF</p>
              <p className="text-xs text-muted-foreground">Administrador de IA de Novus</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold">{heading.title}</h2>
          {heading.subtitle && <p className="mt-1 text-sm text-muted-foreground">{heading.subtitle}</p>}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {(step === "credentials" || step === "resetCode") && (
              <Field id="email" label="Correo">
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                  readOnly={step === "resetCode"}
                />
              </Field>
            )}

            {step === "credentials" && !forgot && (
              <Field id="password" label="Contraseña">
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
              </Field>
            )}

            {step === "resetCode" && (
              <Field id="reset-code" label="Código del correo">
                <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className="field font-mono tracking-widest" />
              </Field>
            )}

            {needsStrong && (
              <>
                <Field id="new-password" label="Nueva contraseña">
                  <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
                </Field>
                <PasswordRules value={password} />
                <Field id="confirm-password" label="Confirma la contraseña">
                  <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" />
                </Field>
              </>
            )}

            {step === "totpSetup" && totpUri && (
              <div className="flex justify-center rounded-xl bg-white p-4">
                <QRCodeSVG value={totpUri} size={168} aria-label="Código QR para tu app de autenticación" />
              </div>
            )}

            {(step === "totp" || step === "totpSetup") && (
              <Field id="totp" label="Código de 6 dígitos">
                <input
                  id="totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="field text-center font-mono text-lg tracking-[0.5em]"
                />
              </Field>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
                {error}
              </p>
            )}

            {step !== "unsupported" && (
              <button type="submit" className="btn-primary w-full" disabled={submitDisabled}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : step === "credentials" && !forgot ? <KeyRound className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                {step === "credentials" ? (forgot ? "Enviar código" : "Ingresar") : step === "resetCode" ? "Guardar contraseña" : "Continuar"}
              </button>
            )}
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            {step === "credentials" ? (
              <button type="button" className="text-muted-foreground transition hover:text-foreground" onClick={() => { setForgot(!forgot); setError(null); }}>
                {forgot ? "Volver a ingresar" : "¿Olvidaste tu contraseña?"}
              </button>
            ) : (
              <button type="button" className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground" onClick={() => auth.backToCredentials()}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver
              </button>
            )}
            <span className="text-xs text-muted-foreground/70">Acceso solo por invitación</span>
          </div>
        </section>
      </div>
    </div>
  );
}
