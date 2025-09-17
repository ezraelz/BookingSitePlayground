import React from "react";

const AboutUs = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          About Our Playground Rentals
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Welcome to <span className="font-semibold text-green-600">PlayRent</span>, 
          your go-to platform for booking high-quality sports fields and playgrounds. 
          Whether you’re planning a casual weekend match, training session, or a big tournament, 
          we make it easy to find and reserve the perfect space.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        <div className="bg-white shadow rounded-2xl p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Easy Booking</h3>
          <p className="text-gray-600">
            Find available playgrounds near you and reserve your preferred time slot in just a few clicks.
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Affordable Prices</h3>
          <p className="text-gray-600">
            We work with local field owners to bring you the best rates without hidden costs.
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Quality Fields</h3>
          <p className="text-gray-600">
            Our listed playgrounds are well-maintained, ensuring a safe and enjoyable experience for everyone.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition">
          Book a Playground Now
        </button>
      </div>
    </section>
  );
};

export default AboutUs;
