import React from "react";

const AboutUs = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6 lg:px-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 opacity-10 rounded-full -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full translate-x-12 translate-y-12"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-green-600">PlayRent</span>
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to <span className="font-semibold text-green-600">PlayRent</span>, 
            your go-to platform for booking high-quality sports fields and playgrounds. 
            Whether you're planning a casual weekend match, training session, or a big tournament, 
            we make it easy to find and reserve the perfect space.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
            <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Easy Booking</h3>
            <p className="text-gray-600 text-center flex-grow">
              Find available playgrounds near you and reserve your preferred time slot in just a few clicks.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
            <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Affordable Prices</h3>
            <p className="text-gray-600 text-center flex-grow">
              We work with local field owners to bring you the best rates without hidden costs.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
            <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Quality Fields</h3>
            <p className="text-gray-600 text-center flex-grow">
              Our listed playgrounds are well-maintained, ensuring a safe and enjoyable experience for everyone.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center justify-center mx-auto">
            Book a Playground Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <p className="text-gray-500 mt-6">
            Join thousands of satisfied customers who have booked with us
          </p>
          <div className="flex items-center justify-center mt-4 space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-600 ml-2">4.9/5 from 1200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;