"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LINKS } from "@/lib/content";
import { LinkIcon } from "./LinkIcon";
import { Stroke } from "./Mark";

const WHO = ["Recruiter", "Student", "Founder", "Just saying hi"] as const;

type Errors = Partial<Record<"name" | "email" | "message", string>>;

type Payload = { name: string; email: string; org: string; message: string; who: string };

/**
 * Fallback path. EmailJS only accepts these credentials from a browser unless
 * the account enables non-browser access, so the server hands off to here.
 * The public key is designed to be exposed; nothing secret ships in the bundle.
 */
async function sendFromBrowser(p: Payload): Promise<boolean> {
  const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const key = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!service || !template || !key) return false;

  const composed = [p.message, "", `— ${p.who}${p.org ? ` at ${p.org}` : ""}`, `Reply to: ${p.email}`].join("\n");
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        service_id: service,
        template_id: template,
        user_id: key,
        template_params: {
          from_name: p.name,
          from_email: p.email,
          reply_to: p.email,
          message: composed,
          who: p.who,
          company: p.org,
          subject: `${p.who} via shauraya.ca — ${p.name}`,
        },
      }),
    });
    if (!res.ok) console.error("emailjs:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("emailjs:", err);
    return false;
  }
}

/**
 * The reach-out form. Same sheet shell as the project detail view so the site
 * has one modal idiom, and portalled for the same stacking reason.
 */
export function ContactForm({ onClose, ticket }: { onClose: () => void; ticket: () => Promise<string | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  const [who, setWho] = useState<string>("Recruiter");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failure, setFailure] = useState("");
  const [draft, setDraft] = useState<Payload | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    firstField.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const name = String(form.get("name") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const org = String(form.get("org") ?? "").trim();
      const message = String(form.get("message") ?? "").trim();
      const decoy = String(form.get("website") ?? "");

      const next: Errors = {};
      if (!name) next.name = "Required";
      if (!email) next.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "That doesn't look right";
      if (!message) next.message = "Required";
      else if (message.length < 10) next.message = "A little more to go on, please";

      setErrors(next);
      if (Object.keys(next).length) return;

      const payload: Payload = { name, email, org, message, who };
      setDraft(payload);
      setState("sending");
      try {
        const tok = await ticket();
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, org, message, who, decoy, token: tok }),
        });
        // 409 means EmailJS is refusing server-side calls on this account, so
        // send it straight from here instead. Same payload either way.
        if (res.status === 409) {
          const ok = await sendFromBrowser(payload);
          setState(ok ? "sent" : "failed");
          if (!ok) setFailure("That didn't go through. Your message is kept below — send it as an email instead.");
          return;
        }
        if (!res.ok) {
          setFailure((await res.text().catch(() => "")) || "That didn't send. Email works too.");
          setState("failed");
          return;
        }
        setState("sent");
      } catch {
        setFailure("That didn't send. Email works too.");
        setState("failed");
      }
    },
    [ticket, who],
  );

  // If sending fell over, hand the draft to their mail client rather than
  // making them type it again.
  const mailto = (() => {
    const subject = draft ? `${draft.who} via shauraya.ca — ${draft.name}` : "Hello";
    const body = draft
      ? [draft.message, "", `— ${draft.name}${draft.org ? ` at ${draft.org}` : ""}`].join("\n")
      : "";
    return `${LINKS.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
  })();

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet sheet-form"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Send a note"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-head">
          <span className="eyebrow">Get in touch</span>
          <h2>Send a note</h2>
          <button className="form-close" onClick={onClose} aria-label="Close">
            <Stroke d="M6 6l12 12M18 6L6 18" size={15} width={1.7} />
          </button>
        </div>

        {state === "sent" ? (
          <div className="form-done">
            <div className="tick">
              <Stroke d="M5 13l4.5 4.5L19 7" size={22} width={1.8} />
            </div>
            <h3>That's away.</h3>
            <p>
              It lands in my inbox and I'll reply from {LINKS.emailText}. If it's urgent, that address
              works directly too.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Back to the conversation
            </button>
          </div>
        ) : (
          <form className="form-body" onSubmit={submit} noValidate>
            {/* A div rather than fieldset/legend: a <legend> is laid out outside the
                fieldset's flex box, so the 7px label gap never applied to it. */}
            <div className="field" role="group" aria-labelledby="who-label">
              <span className="label" id="who-label">
                Who&apos;s reaching out?
              </span>
              <div className="pickers">
                {WHO.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={who === w ? "picker on" : "picker"}
                    aria-pressed={who === w}
                    onClick={() => setWho(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row">
              <label className="field">
                <span className="label">Name</span>
                <input ref={firstField} name="name" autoComplete="name" placeholder="Your name" />
                {errors.name && <span className="err">{errors.name}</span>}
              </label>
              <label className="field">
                <span className="label">Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@where.com" />
                {errors.email && <span className="err">{errors.email}</span>}
              </label>
            </div>

            <label className="field">
              <span className="label">
                Company or school <em>— optional</em>
              </span>
              <input name="org" autoComplete="organization" placeholder="Where you're writing from" />
            </label>

            <label className="field">
              <span className="label">Message</span>
              <textarea
                name="message"
                rows={4}
                placeholder="What you're working on, what you need, or just hello."
              />
              {errors.message && <span className="err">{errors.message}</span>}
            </label>

            {/* Bots fill this; people never see it. */}
            <input name="website" className="decoy" tabIndex={-1} autoComplete="off" aria-hidden />

            {state === "failed" && (
              <div className="form-failed">
                <p>{failure}</p>
                <a href={mailto}>
                  <LinkIcon kind="mail" size={13} />
                  Send it as an email instead
                </a>
              </div>
            )}

            <div className="form-foot">
              <span>Usually answered within a day or two.</span>
              <button className="btn-primary" type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : "Send it"}
                {state !== "sending" && <Stroke d="M7 17 17 7M9 7h8v8" size={12} width={1.7} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
