import React from "react";
import { motion } from "framer-motion";
import { 
  FaFutbol, 
  FaCalendarCheck, 
  FaUsers, 
  FaRegClock,
  FaArrowRight
} from "react-icons/fa";

// Define TypeScript interface for service items
interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Services: React.FC = () => {
  const services: ServiceItem[] = [
    {
      icon: <FaFutbol className="text-green-500 text-3xl" />,
      title: "Playground Rentals",
      description:
        "Rent well-maintained football, basketball, and multipurpose fields for your events, training, or weekend games.",
      delay: 0.1
    },
    {
      icon: <FaCalendarCheck className="text-green-500 text-3xl" />,
      title: "Easy Online Booking",
      description:
        "Check real-time availability and reserve your preferred playground instantly through our platform.",
      delay: 0.2
    },
    {
      icon: <FaUsers className="text-green-500 text-3xl" />,
      title: "Group Events & Tournaments",
      description:
        "Organize matches, tournaments, and community sports events with dedicated booking support.",
      delay: 0.3
    },
    {
      icon: <FaRegClock className="text-green-500 text-3xl" />,
      title: "Flexible Time Slots",
      description:
        "Choose hourly or daily bookings to fit your schedule, with options for recurring reservations.",
      delay: 0.4
    },
  ];

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section id="services" className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6 lg:px-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our <span className="text-green-600">Services</span>
          </h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We provide a seamless way to discover, book, and enjoy playgrounds and
            sports fields. Whether it's a friendly match, a training session, or a
            tournament — we've got you covered.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-6 p-3 bg-green-50 rounded-lg w-fit group-hover:bg-green-100 transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>
              <button 
                className="flex items-center text-green-600 font-medium mt-auto group-hover:translate-x-1 transition-transform duration-300"
                aria-label={`Learn more about ${service.title}`}
              >
                Learn more
                <FaArrowRight className="ml-2 text-sm" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
            Explore All Services
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;