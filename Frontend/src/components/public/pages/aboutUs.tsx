import React from "react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/booking");
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-green-600">WUB CourtYard</span>
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Welcome to <span className="font-semibold text-green-600">WUB CourtYard</span>, 
            your premier destination for booking high-quality football fields and sports facilities. 
            We're dedicated to connecting sports enthusiasts with the perfect playing spaces for 
            casual matches, training sessions, and competitive tournaments.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Easy Booking</h3>
            <p className="text-gray-600 text-center">
              Our intuitive platform lets you find and reserve the perfect field in minutes. 
              Real-time availability and instant confirmations make planning effortless.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Affordable Prices</h3>
            <p className="text-gray-600 text-center">
              We partner with field owners to offer competitive rates with no hidden fees. 
              Various pricing options to fit every budget and occasion.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Quality Fields</h3>
            <p className="text-gray-600 text-center">
              Every venue in our network is verified for quality, maintenance, and safety standards. 
              Enjoy premium playing surfaces and facilities for optimal performance.
            </p>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2 p-10 bg-gradient-to-br from-green-50 to-blue-50 flex items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  At WUB CourtYard, we believe that everyone should have access to quality sports facilities. 
                  Our mission is to remove the barriers between players and playing spaces, making it easier 
                  to enjoy the beautiful game of football.
                </p>
                <p className="text-gray-600">
                  Whether you're a casual player looking for a weekend game or a team preparing for a tournament, 
                  we're here to ensure you have the best possible experience.
                </p>
              </div>
            </div>
            <div className="md:w-1/2 p-10 bg-gray-800 text-white flex items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Why Choose Us?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Wide selection of verified fields</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Secure and easy payment options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Flexible cancellation policies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>User reviews and ratings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ready to Play?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of players who have already discovered the easiest way to book football fields. 
            Your perfect game is just a few clicks away.
          </p>
          <button 
            onClick={handleBookNow}
            className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-300 transform hover:scale-105"
          >
            Book a Playground Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;