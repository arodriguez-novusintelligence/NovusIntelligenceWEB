/** Pasos de la pantalla de acceso, independientes de Amplify para poder probarlos. */
export type AuthStep =
  | "credentials"
  | "newPassword"
  | "totp"
  | "totpSetup"
  | "resetCode"
  | "done"
  | "unsupported";

/** Traduce el `nextStep.signInStep` de Amplify v6 al paso de nuestra UI. */
export function stepFromSignIn(signInStep: string | undefined): AuthStep {
  switch (signInStep) {
    case "DONE":
      return "done";
    case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
      return "newPassword";
    case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
      return "totp";
    case "CONTINUE_SIGN_IN_WITH_TOTP_SETUP":
      return "totpSetup";
    case "RESET_PASSWORD":
      return "resetCode";
    default:
      return "unsupported";
  }
}

const COGNITO_ERRORS: Record<string, string> = {
  NotAuthorizedException: "Correo o contraseña incorrectos.",
  UserNotFoundException: "Correo o contraseña incorrectos.",
  CodeMismatchException: "El código no es válido. Revisa tu app de autenticación e inténtalo de nuevo.",
  ExpiredCodeException: "El código venció. Pide uno nuevo.",
  InvalidPasswordException:
    "La contraseña debe tener al menos 12 caracteres, con mayúsculas, minúsculas, números y símbolos.",
  LimitExceededException: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  TooManyRequestsException: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  PasswordResetRequiredException: "Debes restablecer tu contraseña.",
  EnableSoftwareTokenMFAException: "El código no es válido. Revisa la hora de tu teléfono e inténtalo de nuevo.",
};

/** Mensaje en español para errores de Cognito, sin exponer detalles internos. */
export function authErrorMessage(error: unknown): string {
  const name = (error as { name?: string } | null)?.name ?? "";
  return COGNITO_ERRORS[name] ?? "No pudimos completar el acceso. Inténtalo de nuevo.";
}

export function isStrongPassword(value: string): boolean {
  return (
    value.length >= 12 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
