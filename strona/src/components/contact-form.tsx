"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import Link from "next/link";

export function ContactForm({ email: recipient }: { email: string }) {
  const [status, setStatus] = useState("");

  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "").trim();
        const email = String(form.get("email") ?? "").trim();
        const subject = String(form.get("subject") ?? "").trim();
        const message = String(form.get("message") ?? "").trim();
        const body = [
          `Imię i nazwisko: ${name}`,
          `E-mail do odpowiedzi: ${email}`,
          "",
          message,
        ].join("\n");
        setStatus(
          "Otwieram program pocztowy. Wiadomość wyślesz dopiero po jej sprawdzeniu.",
        );
        window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(
          `[SmartFach] ${subject}`,
        )}&body=${encodeURIComponent(body)}`;
      }}
    >
      <div className="two-fields">
        <div className="field">
          <label htmlFor="contact-name">Imię i nazwisko</label>
          <input id="contact-name" name="name" maxLength={160} required />
        </div>
        <div className="field">
          <label htmlFor="contact-email">E-mail</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            maxLength={160}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-subject">W czym możemy pomóc?</label>
        <select id="contact-subject" name="subject" defaultValue="Pytanie o SmartFach">
          <option>Pytanie o SmartFach</option>
          <option>Chcę przetestować SmartFach</option>
          <option>Pomoc w wyborze planu</option>
          <option>Pomoc techniczna</option>
          <option>Płatność lub zwrot</option>
          <option>Odstąpienie od umowy</option>
          <option>Inna sprawa</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="contact-message">Wiadomość</label>
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          maxLength={4000}
          required
          placeholder="Napisz krótko, czego potrzebujesz…"
        />
      </div>
      <label className="contact-privacy">
        <input type="checkbox" required />
        <span>
          Zapoznałem się z <Link href="/polityka-prywatnosci">Polityką prywatności</Link>.
          Nie wpisuję danych wrażliwych ani danych klientów.
        </span>
      </label>
      <div className="contact-submit-row">
        <button className="button button-primary" type="submit">
          <Mail size={18} />
          Przygotuj wiadomość
          <ArrowRight size={17} />
        </button>
        <p>
          Formularz otworzy wiadomość w Twoim programie pocztowym. Nic nie
          zostanie wysłane bez Twojego potwierdzenia.
        </p>
      </div>
      {status && (
        <p className="contact-status" role="status">
          <Check size={16} /> {status}
        </p>
      )}
    </form>
  );
}
