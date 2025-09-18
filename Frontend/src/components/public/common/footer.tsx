import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../hooks/api";
import { toast } from "react-toastify";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

type EmailPayload = { email: string };

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();

    if (!value) return;
    // basic email check
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) {
      toast.info("Please enter a valid email.");
      return;
    }

    const saved = (localStorage.getItem("SubscribedEmail") || "").toLowerCase();
    if (saved === value) {
      toast.info("You're already subscribed ✨");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post<EmailPayload>("/subscribers/", { email: value });
      localStorage.setItem("SubscribedEmail", value);
      setEmail("");
      toast.success("Subscribed successfully! 🎉");
    } catch (err) {
      toast.error("Subscription failed. Please try again.");
      // console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const socials = [
    { Icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
    { Icon: FaTwitter, href: "https://twitter.com", label: "Twitter (X)" },
    { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
    { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
    { Icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300">
      {/* subtle top glow line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/40 to-cyan-500/40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow">
                {/* simple brand glyph */}
                <span className="h-5 w-5 rounded-full bg-white/95" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-xl font-extrabold text-transparent">
                PlayRent
              </span>
            </Link>

            <p className="mt-4 text-sm text-slate-400">
              Book football, basketball, and tennis facilities with confidence.
              Simple, secure, and reliable.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Icon className="h-4 w-4 text-slate-300 transition group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white/90">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white/90">
                  About
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white/90">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white/90">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white/90">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white/90">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white/90">
                  Explore Fields
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-white/90">
                  Book a Field
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white/90">Subscribe</h4>
            <p className="mt-3 text-sm text-slate-400">
              Get updates about new venues and special offers.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4">
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full rounded-xl bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-1 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {new Date().getFullYear()} PlayRent. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-white/80">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-white/80">
                Privacy
              </Link>
              <a
                href="mailto:support@playrent.example"
                className="hover:text-white/80"
              >
                support@playrent.example
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
