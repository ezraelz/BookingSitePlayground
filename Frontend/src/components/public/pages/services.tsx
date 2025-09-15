import React from "react";
import { motion } from "framer-motion";
import { FaFutbol, FaCalendarCheck, FaUsers, FaRegClock } from "react-icons/fa";

const Services = () => {
  const services = [
    {
      icon: <FaFutbol className="text-green-600 text-4xl mb-4" />,
      title: "Playground Rentals",
      description:
        "Rent well-maintained football, basketball, and multipurpose fields for your events, training, or weekend games.",
    },
    {
      icon: <FaCalendarCheck className="text-green-600 text-4xl mb-4" />,
      title: "Easy Online Booking",
      description:
        "Check real-time availability and reserve your preferred playground instantly through our platform.",
    },
    {
      icon: <FaUsers className="text-green-600 text-4xl mb-4" />,
      title: "Group Events & Tournaments",
      description:
        "Organize matches, tournaments, and community sports events with dedicated booking support.",
    },
    {
      icon: <FaRegClock className="text-green-600 text-4xl mb-4" />,
      title: "Flexible Time Slots",
      description:
        "Choose hourly or daily bookings to fit your schedule, with options for recurring reservations.",
    },
  ];

  return (
    <section className="bg-gray-50 py-12 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          Our Services
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600 mb-10 leading-relaxed"
        >
          We provide a seamless way to discover, book, and enjoy playgrounds and
          sports fields. Whether it’s a friendly match, a training session, or a
          tournament — we’ve got you covered.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              {service.icon}
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
