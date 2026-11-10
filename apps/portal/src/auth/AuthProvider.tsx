import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Amplify } from "aws-amplify";
import {
  confirmResetPassword,
  confirmSignIn,
  fetchMFAPreference,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  type SignInOutput,
} from "aws-amplify/auth";
import { config } from "@/config";
import { getMe, type Me } from "@/api/client";
import { stepFromSignIn, type AuthStep } from "./steps";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.userPoolId,
      userPoolClientId: config.userPoolClientId,
      loginWith: { email: true },
    },
  },
});

type SessionState =
  | { status: "loading" }
  | { status: "signedOut"; step: AuthStep; totpUri?: string; email?: string }
  | { status: "signedIn"; me: Me; mfaEnabled: boolean }
  | { status: "error"; message: string };

interface AuthContextValue {
  state: SessionState;
  startSignIn(email: string, password: string): Promise<void>;
  answerChallenge(response: string): Promise<void>;
  requestReset(email: string): Promise<void>;
  completeReset(email: string, code: string, newPassword: string): Promise<void>;
  backToCredentials(): void;
  refresh(): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession(): Promise<SessionState> {
  try {
    await getCurrentUser();
  } catch {
    return { status: "signedOut", step: "credentials" };
  }
  try {
    const [me, mfa] = await Promise.all([getMe(), fetchMFAPreference()]);
    return { status: "signedIn", me, mfaEnabled: (mfa.enabled ?? []).includes("TOTP") };
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  const refresh = useCallback(async () => {
    setState(await loadSession());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleOutput = useCallback(
    async (output: SignInOutput, email?: string) => {
      const step = stepFromSignIn(output.nextStep.signInStep);
      if (step === "done") {
        await refresh();
        return;
      }
      let totpUri: string | undefined;
      if (output.nextStep.signInStep === "CONTINUE_SIGN_IN_WITH_TOTP_SETUP") {
        totpUri = output.nextStep.totpSetupDetails.getSetupUri("NADF Novus", email).toString();
      }
      setState({ status: "signedOut", step, totpUri, email });
    },
    [refresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      async startSignIn(email, password) {
        const output = await signIn({ username: email.trim().toLowerCase(), password });
        await handleOutput(output, email);
      },
      async answerChallenge(response) {
        const email = state.status === "signedOut" ? state.email : undefined;
        const output = await confirmSignIn({ challengeResponse: response });
        await handleOutput(output, email);
      },
      async requestReset(email) {
        await resetPassword({ username: email.trim().toLowerCase() });
        setState({ status: "signedOut", step: "resetCode", email });
      },
      async completeReset(email, code, newPassword) {
        await confirmResetPassword({ username: email.trim().toLowerCase(), confirmationCode: code, newPassword });
        setState({ status: "signedOut", step: "credentials", email });
      },
      backToCredentials() {
        setState({ status: "signedOut", step: "credentials" });
      },
      refresh,
      async logout() {
        await signOut();
        setState({ status: "signedOut", step: "credentials" });
      },
    }),
    [state, handleOutput, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
