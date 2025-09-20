import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import bg from '../../../assets/images/soccer-afl-01-v1.jpg';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      aria-label="PlayRent Hero"
      className="relative w-full min-h-[70vh] md:min-h-[80vh] grid place-items-center overflow-hidden bg-slate-900"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl text-white"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              PlayRent
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-2xl text-white/90">
            Reserve premium football, basketball, and tennis fields in minutes.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/booking')}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-white font-semibold shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white font-semibold backdrop-blur transition hover:bg-white/20"
            >
              Explore Venues
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              24/7 Booking
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              Secure Payments
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
              Addis Community
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute bottom-6 z-10 text-white/80"
        aria-hidden="true"
      >
        <span className="inline-block animate-bounce text-2xl">⌄</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
