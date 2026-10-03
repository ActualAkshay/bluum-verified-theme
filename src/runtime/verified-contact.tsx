import type { FormEventHandler, Ref } from "react"
import { VerifiedSupport } from "./verified-support"

export function contactMessageWithSubject(message: string, subject: string) {
  const cleanSubject = subject.trim()
  return cleanSubject ? `Subject: ${cleanSubject}\n\n${message}` : message
}

type Props = {
  onSubmit: FormEventHandler<HTMLFormElement>
  message: string
  onMessageChange: (value: string) => void
  messageRef: Ref<HTMLTextAreaElement>
  messageError: string
  submitting: boolean
  status: { type: "success" | "error"; message: string } | null
}

const ContactIcon = ({ kind }: { kind: "email" | "phone" | "location" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "email" ? <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></> : kind === "phone" ? <path d="M20 16v3a2 2 0 0 1-2.2 2A19 19 0 0 1 3 6.2 2 2 0 0 1 5 4h3l1 5-2 2a15 15 0 0 0 6 6l2-2 5 1Z" /> : <><path d="M18 9c0 5-6 9-6 9S6 14 6 9a6 6 0 0 1 12 0Z" /><circle cx="12" cy="9" r="2" /><path d="M6 21h12" /></>}
  </svg>
)

export const VerifiedContact = ({ onSubmit, message, onMessageChange, messageRef, messageError, submitting, status }: Props) => (
  <main className="verified-contact-v2" data-theme-page="contact">
    <section className="verified-contact-hero">
      <img className="verified-contact-art" src="/images/themes/verified/contact-hero.png" alt="" fetchPriority="high" />
      <div className="verified-contact-hero-copy">
        <p className="verified-contact-eyebrow">Contact</p>
        <h1>Reach out <em>anytime</em></h1>
        <p>You can reach us directly at <a href="mailto:hello@bluumpeptides.com">hello@bluumpeptides.com</a>, start a conversation via the chat, or simply fill out the contact form below - whatever works best for you.</p>
      </div>
    </section>
    <section className="verified-contact-body" aria-label="Contact Bluum">
      <div className="verified-contact-details">
        <h2>How can we <em>help?</em></h2>
        <div className="verified-contact-options">
          <a href="mailto:hello@bluumpeptides.com"><span className="verified-contact-icon"><ContactIcon kind="email" /></span><span><strong>Email</strong><span>hello@bluumpeptides.com</span></span></a>
          <a href="tel:+16283037232"><span className="verified-contact-icon"><ContactIcon kind="phone" /></span><span><strong>Phone</strong><span>(628) 303-7232</span></span></a>
          <div><span className="verified-contact-icon"><ContactIcon kind="location" /></span><span><strong>Location</strong><span>30 N Gould St Ste N Sheridan, WY 82801</span></span></div>
        </div>
      </div>
      <form className="verified-contact-form" onSubmit={onSubmit} aria-label="Contact form">
        <div className="verified-contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
        <label className="verified-contact-field" htmlFor="contact-name"><span>Full Name</span><input id="contact-name" name="contact[name]" autoComplete="name" required placeholder="Enter Full Name" /></label>
        <label className="verified-contact-field" htmlFor="contact-email"><span>Email Address</span><input id="contact-email" name="contact[email]" type="email" autoComplete="email" required placeholder="Enter Email Address" /></label>
        <label className="verified-contact-field" htmlFor="contact-subject"><span>Subject</span><input id="contact-subject" name="contact[subject]" maxLength={200} placeholder="How can we help you?" /></label>
        <div className="verified-contact-field"><label htmlFor="contact-message">Message</label><textarea ref={messageRef} id="contact-message" name="contact[body]" value={message} onChange={(event) => onMessageChange(event.target.value)} maxLength={4789} required placeholder="Enter Message" aria-invalid={Boolean(messageError)} aria-describedby={messageError ? "contact-message-error" : undefined} />
          {messageError && <p id="contact-message-error" className="verified-contact-error" role="alert">{messageError}</p>}
        </div>
        <button className="verified-button" disabled={submitting} type="submit">{submitting ? "Sending…" : "Submit"}</button>
        {status && <p className={status.type === "error" ? "verified-contact-error" : "verified-contact-success"} role={status.type === "error" ? "alert" : "status"}>{status.message}</p>}
      </form>
      <aside className="verified-contact-notice" aria-label="Research use only contact notice">Important Research Use Only Notice: Bluum Peptides products are intended strictly for laboratory research use only and are not for human or animal consumption. We are unable to answer questions about reconstitution, administration, dosing, personal use, or any non-research application. Customers who request prohibited guidance or indicate intended personal use may have their account restricted and may be refused future service.</aside>
    </section>
    <VerifiedSupport />
  </main>
)
