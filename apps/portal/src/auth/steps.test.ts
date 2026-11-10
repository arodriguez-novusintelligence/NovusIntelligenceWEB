import { describe, expect, it } from "vitest";
import { authErrorMessage, isStrongPassword, stepFromSignIn } from "./steps";

describe("stepFromSignIn", () => {
  it("traduce los pasos de Amplify a la UI", () => {
    expect(stepFromSignIn("DONE")).toBe("done");
    expect(stepFromSignIn("CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED")).toBe("newPassword");
    expect(stepFromSignIn("CONFIRM_SIGN_IN_WITH_TOTP_CODE")).toBe("totp");
    expect(stepFromSignIn("CONTINUE_SIGN_IN_WITH_TOTP_SETUP")).toBe("totpSetup");
    expect(stepFromSignIn("RESET_PASSWORD")).toBe("resetCode");
  });

  it("marca como no soportado cualquier paso desconocido", () => {
    expect(stepFromSignIn("CONFIRM_SIGN_IN_WITH_SMS_CODE")).toBe("unsupported");
    expect(stepFromSignIn(undefined)).toBe("unsupported");
  });
});

describe("authErrorMessage", () => {
  it("no revela si el usuario existe", () => {
    expect(authErrorMessage({ name: "UserNotFoundException" })).toBe(authErrorMessage({ name: "NotAuthorizedException" }));
  });
  it("usa un mensaje genérico para errores desconocidos", () => {
    expect(authErrorMessage(new Error("detalle interno"))).not.toContain("detalle interno");
  });
});

describe("isStrongPassword", () => {
  it("exige 12 caracteres con mayúsculas, minúsculas, números y símbolos", () => {
    expect(isStrongPassword("Corta1!")).toBe(false);
    expect(isStrongPassword("sinmayusculas123!")).toBe(false);
    expect(isStrongPassword("SinSimbolos12345")).toBe(false);
    expect(isStrongPassword("Segura-Novus-2026")).toBe(true);
  });
});
