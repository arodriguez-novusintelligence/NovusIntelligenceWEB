import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, MailPlus, RotateCw, ShieldCheck, UserPlus } from "lucide-react";
import { createMember, listTeam, reinviteMember, updateMember, type TeamMember } from "@/api/admin";
import { ApiError, type Me } from "@/api/client";
import { cn } from "@/lib/cn";
import { ROLE_LABELS } from "@/lib/navigation";

const ROLE_HELP: Record<string, string> = {
  admin: "Todo dentro de la empresa: equipo, solicitudes, aprobaciones y configuración.",
  aprobador: "Revisa y aprueba o rechaza despliegues a PROD (requiere verificación en dos pasos).",
  funcional: "Pide ajustes a la IA y sigue sus solicitudes.",
  desarrollador: "Crea flujos, opera despliegues y revisa todo lo técnico.",
  arquitecto: "Ajusta la definición de los agentes y los flujos solo para la empresa.",
  observador: "Solo lectura de solicitudes y despliegues.",
};

function RolePicker({ roles, value, onChange }: { roles: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => {
        const on = value.includes(r);
        return (
          <button
            key={r}
            type="button"
            title={ROLE_HELP[r]}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== r) : [...value, r])}
            className={cn("chip transition", on ? "border-secondary/60 bg-secondary/15 text-foreground" : "hover:border-white/25")}
          >
            {ROLE_LABELS[r] ?? r}
          </button>
        );
      })}
    </div>
  );
}

/** Equipo de la empresa: el Admin crea usuarios con roles; todo queda auditado. */
export function TeamPage({ me }: { me: Me }) {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", roles: ["funcional"] as string[] });
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listTeam();
      setMembers(data.members.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email)));
      setRoles(data.assignableRoles);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar el equipo.");
    }
  }, []);
  useEffect(() => void load(), [load]);

  async function run(key: string, fn: () => Promise<unknown>, ok?: string) {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await fn();
      if (ok) setNotice(ok);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo completar la acción.");
    } finally {
      setBusy(null);
    }
  }

  function invite(e: FormEvent) {
    e.preventDefault();
    void run("create", () => createMember(form), `Invitación enviada a ${form.email}. Recibirá una contraseña temporal por correo.`).then(() => setForm({ email: "", name: "", roles: ["funcional"] }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="space-y-2 pt-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">Equipo</p>
        <h1 className="text-3xl font-semibold">Personas de {me.company.name}</h1>
        <p className="text-muted-foreground">Invita personas y asígnales roles. Cada acceso queda limitado a {me.company.name} y cada cambio queda en la auditoría.</p>
      </section>

      <form onSubmit={invite} className="glass ai-border space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserPlus className="h-5 w-5 text-secondary" aria-hidden="true" /> Invitar a una persona
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Nombre</span>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} autoComplete="off" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Correo</span>
            <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="off" />
          </label>
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Roles</span>
          <RolePicker roles={roles} value={form.roles} onChange={(v) => setForm({ ...form, roles: v })} />
          <ul className="grid gap-1 pt-1 text-xs text-muted-foreground sm:grid-cols-2">
            {form.roles.map((r) => (
              <li key={r}>
                <strong className="text-foreground/80">{ROLE_LABELS[r]}:</strong> {ROLE_HELP[r]}
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="btn-primary" disabled={busy === "create" || !form.roles.length}>
          {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MailPlus className="h-4 w-4" aria-hidden="true" />} Enviar invitación
        </button>
      </form>

      {notice && <p className="text-sm text-good" role="status">{notice}</p>}
      {error && <p className="text-sm text-bad" role="alert">{error}</p>}

      <section className="glass p-0" aria-label="Personas">
        {!members ? (
          <p className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando…
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {members.map((m) => (
              <MemberRow key={m.userId} member={m} roles={roles} self={m.userId === me.user.id} busy={busy} onRun={run} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MemberRow({ member, roles, self, busy, onRun }: { member: TeamMember; roles: string[]; self: boolean; busy: string | null; onRun: (key: string, fn: () => Promise<unknown>, ok?: string) => Promise<void> }) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(member.roles.filter((r) => r !== "novus-admin"));
  const pending = member.cognito?.status === "FORCE_CHANGE_PASSWORD";
  const disabled = member.status === "disabled";
  const novus = member.roles.includes("novus-admin");
  return (
    <li className="flex flex-wrap items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {member.name ?? member.email} {self && <span className="text-xs text-muted-foreground">(tú)</span>}
        </p>
        <p className="text-sm text-muted-foreground">{member.email}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {!edit && member.roles.map((r) => <span key={r} className="chip px-2 py-0.5 text-[11px]">{ROLE_LABELS[r] ?? r}</span>)}
          {disabled && <span className="chip border-bad/40 px-2 py-0.5 text-[11px] text-bad">Desactivado</span>}
          {pending && <span className="chip border-warn/40 px-2 py-0.5 text-[11px] text-warn">Invitación pendiente</span>}
          {member.cognito?.mfa && (
            <span className="chip px-2 py-0.5 text-[11px] text-good">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> 2 pasos
            </span>
          )}
        </div>
        {edit && (
          <div className="mt-2 space-y-2">
            <RolePicker roles={roles} value={value} onChange={setValue} />
            <div className="flex gap-2">
              <button type="button" className="btn-primary px-3 py-1.5 text-xs" disabled={!value.length || busy === member.userId} onClick={() => void onRun(member.userId, () => updateMember(member.userId, { roles: value }), "Roles actualizados.").then(() => setEdit(false))}>
                Guardar roles
              </button>
              <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setEdit(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      {!novus && !edit && (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setEdit(true)}>
            Editar roles
          </button>
          {pending && (
            <button type="button" className="btn-ghost px-3 py-1.5 text-xs" disabled={busy === `re-${member.userId}`} onClick={() => void onRun(`re-${member.userId}`, () => reinviteMember(member.userId), "Invitación reenviada.")}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Reenviar
            </button>
          )}
          {!self && (
            <button
              type="button"
              className={cn("btn-ghost px-3 py-1.5 text-xs", !disabled && "text-bad")}
              disabled={busy === `st-${member.userId}`}
              onClick={() => void onRun(`st-${member.userId}`, () => updateMember(member.userId, { status: disabled ? "active" : "disabled" }), disabled ? "Acceso reactivado." : "Acceso desactivado.")}
            >
              {disabled ? "Reactivar" : "Desactivar"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
