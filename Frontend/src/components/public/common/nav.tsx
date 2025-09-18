import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  CalendarDays,
  Cog,
  Info,
  Mail,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../../hooks/api";

axios.defaults.withCredentials = true;

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loggedin, setLoggedin] = useState(false);
  const role = localStorage.getItem("role");

  // Subscription & login check
  useEffect(() => {
    const checkEmail = async () => {
      const savedEmail = localStorage.getItem("SubscribedEmail");
      if (savedEmail) {
        try {
          const res = await axios.get(`/subscribed/check/?email=${savedEmail}`);
          if (res.data.subscribed) setSubscribed(true);
        } catch {
          /* ignore */
        }
      }
    };

    const checkStatus = async () => {
      const username = localStorage.getItem("username");
      if (username) {
        try {
          const res = await axios.get(`/login/check/?username=${username}`);
          if (res.data.loggedin) setLoggedin(true);
        } catch {
          /* ignore */
        }
      }
    };

    checkEmail();
    checkStatus();
  }, []);

  const items: NavItem[] = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/explore", label: "Explore", icon: Compass },
    { to: "/booking", label: "Booking", icon: CalendarDays },
    { to: "/services", label: "Services", icon: Cog },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Mail },
  ];

  if (role === "admin") {
    items.push({ to: "/dashboard", label: "Dashboard", icon: Cog });
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "text-indigo-600 bg-indigo-50"
        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
    }`;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="PlayGround Home"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-extrabold text-transparent">
              PlayGround
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}

            {/* Subscribe / Unsubscribe */}
            {subscribed ? (
              <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-green-500 hover:bg-red-600 px-4 py-2 text-sm font-medium text-white transition">
                Unsubscribe
              </button>
            ) : (
              <Link
                to="/subscribe"
                className="ml-2 inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-medium text-white transition"
              >
                Subscribe
              </Link>
            )}

            {/* Login / Signout */}
            <Link
              to={loggedin ? "/signout" : "/login"}
              className={`ml-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                loggedin
                  ? "bg-green-500 hover:bg-red-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loggedin ? "Signout" : "Sign in"}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-controls="mobile-nav"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur"
            aria-label="Primary mobile"
          >
            <div className="mx-auto max-w-7xl px-2 py-2 grid grid-cols-3 gap-1">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 rounded-lg p-2 text-xs ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </NavLink>
              ))}

              {/* Subscribe / Unsubscribe */}
              {subscribed ? (
                <button className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-white bg-green-500 hover:bg-red-600">
                  Unsubscribe
                </button>
              ) : (
                <Link
                  to="/subscribe"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-white bg-red-500 hover:bg-red-600"
                >
                  Subscribe
                </Link>
              )}

              {/* Sign in/out */}
              <Link
                to={loggedin ? "/signout" : "/login"}
                onClick={() => setOpen(false)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-white ${
                  loggedin
                    ? "bg-green-500 hover:bg-red-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {loggedin ? "Signout" : "Sign in"}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
