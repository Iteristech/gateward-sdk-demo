import { useState } from "react";
import {
  GatewardError,
  type AppConfig,
  type GatewardAuth,
  type MySubscription,
  type PublicForm,
} from "@gateward/sdk";
import { apiPost } from "./api.js";

type Run = (label: string, fn: () => Promise<string | void>) => Promise<void>;

interface Props {
  auth: GatewardAuth;
  run: Run;
  config: AppConfig | null;
  email: string;
  password: string;
}

/** The SDK ships no UI: it moves data and returns states. Everything drawn
 *  here, including the contact form's inputs, is this app's own markup. */
export function Access({ auth, run, config, email, password }: Props) {
  return (
    <>
      <AccessCard auth={auth} run={run} config={config} email={email} password={password} />
      <ListCard auth={auth} run={run} email={email} />
      <FormCard auth={auth} run={run} email={email} />
    </>
  );
}

function AccessCard({ auth, run, config, email, password }: Props) {
  const [code, setCode] = useState("");
  const [waitToken, setWaitToken] = useState("");
  const mode = config?.registration_mode ?? "…";

  return (
    <section className="card">
      <h2>Access · registration is <code>{mode}</code></h2>
      <p className="sub">
        <code>invite_only</code> and <code>waitlist</code> refuse a registration without a code; <code>closed</code> refuses all.
      </p>
      <div className="row wrap">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="invitation code" />
        <button
          onClick={() =>
            run("register with invitation", async () => {
              const res = await auth.register(email, password, { inviteToken: code });
              return res.access_token ? "verified and logged in at once" : "202";
            })
          }
        >
          register with code
        </button>
      </div>
      <div className="row wrap">
        <button onClick={() => run("joinWaitlist", async () => { await auth.joinWaitlist(email, { consentSource: "demo", metadata: { from: "sdk-demo" } }); return "202 — confirm from the inbox (dev log: waitlist_token)"; })}>
          join waitlist
        </button>
        <input value={waitToken} onChange={(e) => setWaitToken(e.target.value)} placeholder="waitlist_token" />
        <button onClick={() => run("confirmWaitlist", async () => { await auth.confirmWaitlist(waitToken); return "confirmed"; })}>
          confirm
        </button>
      </div>
      <div className="row wrap">
        <button onClick={() => run("invite (server)", async () => {
          const r = await apiPost<{ invitations: { token: string }[] }>("/api/invite", { email, sendEmail: false });
          setCode(r.invitations[0]?.token ?? "");
          return "code created, not mailed; pasted above";
        })}>
          invite this email (server)
        </button>
        <button onClick={() => run("releaseWaitlist (server)", async () => {
          const r = await apiPost<{ released: { email: string; token: string | null }[] }>("/api/release-waitlist", { count: 1 });
          setCode(r.released[0]?.token ?? code);
          return `${r.released.length} released${r.released[0] ? ` (${r.released[0].email})` : ""}`;
        })}>
          release 1 from the list (server)
        </button>
      </div>
    </section>
  );
}

function ListCard({ auth, run, email }: Pick<Props, "auth" | "run" | "email">) {
  const [list, setList] = useState("news");
  const [token, setToken] = useState("");
  const [unsub, setUnsub] = useState("");
  const [mine, setMine] = useState<MySubscription[]>([]);

  return (
    <section className="card">
      <h2>Mailing list</h2>
      <div className="row wrap">
        <input value={list} onChange={(e) => setList(e.target.value)} placeholder="list slug" />
        <button onClick={() => run("subscribeToList", async () => { await auth.subscribeToList(list, email, { consentSource: "demo", consentVersion: "2026-10" }); return "202 — confirm from the inbox on a double opt-in list (dev log: list_token)"; })}>
          subscribe
        </button>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="list_token" />
        <button onClick={() => run("confirmSubscription", async () => { await auth.confirmSubscription(token); return "subscribed"; })}>
          confirm
        </button>
      </div>
      <div className="row wrap">
        <input value={unsub} onChange={(e) => setUnsub(e.target.value)} placeholder="unsubscribe token (from a broadcast)" />
        <button onClick={() => run("unsubscribeFromList", async () => { await auth.unsubscribeFromList(unsub); return "left, no login needed"; })}>
          unsubscribe
        </button>
      </div>
      <div className="row wrap">
        <button onClick={() => run("listSubscriptions", async () => { const s = await auth.listSubscriptions(); setMine(s); return `${s.length} list(s)`; })}>
          my subscriptions
        </button>
        <button onClick={() => run("setSubscription on", async () => { await auth.setSubscription(list, true); return "a verified account needs no confirmation mail"; })}>
          subscribe me
        </button>
        <button onClick={() => run("setSubscription off", async () => { await auth.setSubscription(list, false); return "unsubscribed"; })}>
          unsubscribe me
        </button>
        <button onClick={() => run("broadcast (server)", async () => {
          const r = await apiPost<{ queued: number }>("/api/broadcast", { list, subject: "Hello from the demo", text: "A broadcast sent with the API key." });
          return `${r.queued} message(s) queued`;
        })}>
          broadcast (server)
        </button>
      </div>
      <pre>{mine.length ? JSON.stringify(mine, null, 2) : "—"}</pre>
    </section>
  );
}

function FormCard({ auth, run, email }: Pick<Props, "auth" | "run" | "email">) {
  const [slug, setSlug] = useState("contact");
  const [form, setForm] = useState<PublicForm | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shownAt, setShownAt] = useState(0);
  const [trap, setTrap] = useState("");

  const load = () =>
    run("getForm", async () => {
      const f = await auth.getForm(slug);
      setForm(f);
      setErrors({});
      setShownAt(Date.now());
      setValues(Object.fromEntries(f.fields.map((x) => [x.name, x.type === "checkbox" ? false : x.type === "email" ? email : ""])));
      return `${f.fields.length} field(s) · access ${f.access} · min ${f.min_fill_seconds}s`;
    });

  const send = () =>
    run("submitForm", async () => {
      setErrors({});
      try {
        await auth.submitForm(slug, values, { honeypot: trap, startedAt: shownAt });
        return "202 — received";
      } catch (err) {
        // A rejected post names every failing field at once.
        if (err instanceof GatewardError && err.fieldErrors) setErrors(err.fieldErrors);
        throw err;
      }
    });

  return (
    <section className="card">
      <h2>Contact form</h2>
      <p className="sub">The definition lives in Gateward; this page only draws what it describes.</p>
      <div className="row wrap">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="form slug" />
        <button onClick={load}>load form</button>
      </div>
      {form && (
        <div className="form">
          <h3>{form.name}</h3>
          {form.fields.map((f) => (
            <label key={f.name} className="field">
              <span>{f.label ?? f.name}{f.required ? " *" : ""}</span>
              {f.type === "textarea" ? (
                <textarea value={String(values[f.name] ?? "")} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
              ) : f.type === "checkbox" ? (
                <input type="checkbox" checked={Boolean(values[f.name])} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))} />
              ) : f.type === "select" ? (
                <select value={String(values[f.name] ?? "")} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
                  <option value="">—</option>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type === "email" ? "email" : "text"} value={String(values[f.name] ?? "")} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
              )}
              {errors[f.name] && <em className="err">{errors[f.name]}</em>}
            </label>
          ))}
          {/* The honeypot: invisible to people, tempting to bots. */}
          <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} style={{ position: "absolute", left: "-9999px" }} />
          <button onClick={send}>send</button>
        </div>
      )}
    </section>
  );
}
