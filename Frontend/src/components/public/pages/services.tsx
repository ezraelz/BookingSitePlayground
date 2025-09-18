import React from "react";
import { motion } from "framer-motion";
import {
  FaFutbol,
  FaBasketballBall,
  FaTableTennis,
  FaCalendarCheck,
  FaUsers,
  FaRegClock,
  FaTrophy,
  FaBuilding,
  FaBirthdayCake,
  FaChalkboardTeacher,
  FaToolbox,
  FaLightbulb,
  FaCreditCard,
  FaArrowRight,
  FaSyncAlt,
} from "react-icons/fa";

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const Services: React.FC = () => {
  const services: ServiceItem[] = [
    {
      icon: <FaFutbol className="text-green-500 text-3xl" />,
      title: "Football Fields",
      description:
        "Rent well-maintained football fields for friendly matches, training sessions, or league fixtures.",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaBasketballBall className="text-green-500 text-3xl" />,
      title: "Basketball Courts",
      description:
        "Indoor and outdoor courts with clear markings and quality rims—ideal for pick-up games and team practices.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaTableTennis className="text-green-500 text-3xl" />,
      title: "Tennis Courts",
      description:
        "Book hard or synthetic courts. Perfect for casual hits, coaching sessions, or ladder matches.",
      image: "https://images.unsplash.com/photo-1595231776517-8215588332a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaCalendarCheck className="text-green-500 text-3xl" />,
      title: "Easy Online Booking",
      description:
        "Real-time availability, instant confirmation, reminders, and simple changes—all in one place.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaUsers className="text-green-500 text-3xl" />,
      title: "Group Events & Gatherings",
      description:
        "Birthday games, community days, school activities—tell us the vibe and we'll help host it smoothly.",
      image: "https://images.unsplash.com/photo-1549056572-75914d6d7e1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaTrophy className="text-green-500 text-3xl" />,
      title: "Tournaments & Leagues",
      description:
        "Bracket setup, referees, schedules, and results—run football, basketball, or tennis competitions like a pro.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    
    {
      icon: <FaBuilding className="text-green-500 text-3xl" />,
      title: "Corporate & Team Building",
      description:
        "Custom sports days and mini-tournaments for companies—great for morale, culture, and fun.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaRegClock className="text-green-500 text-3xl" />,
      title: "Flexible Time Slots",
      description:
        "Hourly or daily bookings, with recurring options (1, 3, or 6 months). Lock in your favorite times.",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaSyncAlt className="text-green-500 text-3xl" />,
      title: "Recurring Plans (1/3/6 Months)",
      description:
        "Reserve consistent weekly slots for a season—perfect for teams, clubs, and academies.",
      image: "https://images.unsplash.com/photo-1577720643272-265f0936742f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
   
    {
      icon: <FaLightbulb className="text-green-500 text-3xl" />,
      title: "Evening & Night Sessions",
      description:
        "Well-lit pitches and courts for cooler hours—play after work without compromise.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaCreditCard className="text-green-500 text-3xl" />,
      title: "Secure Payments & Invoices",
      description:
        "Pay online, get receipts, and manage team splits with ease.",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      icon: <FaBirthdayCake className="text-green-500 text-3xl" />,
      title: "Parties & Special Packages",
      description:
        "Tailored bundles for birthdays and milestones—venue, time, equipment, and optional staff.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6 lg:px-20"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100 opacity-50" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-green-100 opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="mb-4 text-4xl font-bold text-gray-800">
            Our <span className="text-green-600">Services</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 bg-green-500" />
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Everything you need to play, practice, or host—covering{" "}
            <span className="font-semibold">football</span>,{" "}
            <span className="font-semibold">basketball</span>, and{" "}
            <span className="font-semibold">tennis</span>. From one-off games to
            full tournaments and community gatherings.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["Football", "Basketball", "Tennis", "Events", "Gatherings"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-green-200 bg-white px-3 py-1 text-sm text-green-700 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((s, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              whileHover={{ scale: 1.01 }}
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img 
                  src={s.image} 
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <div className="mb-5 w-fit rounded-lg bg-green-50 p-3 transition-colors duration-300 group-hover:bg-green-100">
                  {s.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 transition-colors duration-300 group-hover:text-green-600">
                  {s.title}
                </h3>
                <p className="mb-5 flex-grow text-gray-600">{s.description}</p>
                <button
                  className="mt-auto inline-flex items-center text-green-600 transition-transform duration-300 group-hover:translate-x-1"
                  aria-label={`Learn more about ${s.title}`}
                >
                  Learn more <FaArrowRight className="ml-2 text-sm" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <button
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-green-700 hover:shadow-lg"
            onClick={() => (window.location.href = "/booking")}
          >
            Book a Field
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
