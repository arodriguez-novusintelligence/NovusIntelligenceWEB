import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Loader2, ShieldX } from "lucide-react";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { NadfMark } from "@/components/NadfMark";
import { NeuralBackdrop } from "@/components/NeuralBackdrop";
import { missingConfig } from "@/config";
import { CommandCenterPage } from "@/pages/CommandCenterPage";
import { LoginPage } from "@/pages/LoginPage";
import { RequestDetailPage } from "@/pages/RequestDetailPage";
import { RequestsPage } from "@/pages/RequestsPage";
import { SecurityPage } from "@/pages/SecurityPage";

function Splash({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <NeuralBackdrop />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-4 text-center">{children}</div>
    </div>
  );
}

function Gate() {
  const { state, logout, refresh } = useAuth();

  if (state.status === "loading") {
    return (
      <Splash>
        <NadfMark size={64} />
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Conectando con NADF…
        </p>
      </Splash>
    );
  }

  if (state.status === "error") {
    return (
      <Splash>
        <ShieldX className="h-10 w-10 text-bad" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">No pudimos abrir tu centro de mando</h1>
        <p className="text-muted-foreground">{state.message}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => void refresh()}>
            Reintentar
          </button>
          <button type="button" className="btn-primary" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>
      </Splash>
    );
  }

  if (state.status === "signedOut") {
    return <LoginPage step={state.step} totpUri={state.totpUri} email={state.email} />;
  }

  const { me, mfaEnabled } = state;
  return (
    <AppShell me={me}>
      <Routes>
        <Route path="/" element={<CommandCenterPage me={me} mfaEnabled={mfaEnabled} />} />
        <Route path="/solicitudes" element={<RequestsPage me={me} />} />
        <Route path="/solicitudes/:id" element={<RequestDetailPage me={me} mfaEnabled={mfaEnabled} />} />
        <Route path="/aprobaciones" element={<RequestsPage me={me} onlyApprovals />} />
        <Route path="/seguridad" element={<SecurityPage me={me} mfaEnabled={mfaEnabled} />} />
        <Route
          path="*"
          element={
            <div className="glass mx-auto mt-10 max-w-lg space-y-3 p-6 text-center">
              <h1 className="text-2xl font-semibold">Esta vista aún no existe</h1>
              <p className="text-muted-foreground">Puede que llegue en una fase posterior del plan.</p>
              <Link to="/" className="btn-primary">
                Volver al centro de mando
              </Link>
            </div>
          }
        />
      </Routes>
    </AppShell>
  );
}

export function App() {
  const missing = missingConfig();
  if (missing.length > 0) {
    return (
      <Splash>
        <NadfMark size={56} animated={false} />
        <h1 className="text-xl font-semibold">Falta configuración</h1>
        <p className="text-sm text-muted-foreground">Define estas variables al compilar: {missing.join(", ")}.</p>
      </Splash>
    );
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
