import React from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '../../../assets/images/soccer-afl-01-v1.jpg';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 max-w-4xl mx-auto">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
          Welcome to <span className="text-green-400">WUB CourtYard!</span>
        </h1>
        
        {/* Subheading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-green-300 animate-fade-in-up delay-150">
          FOOTBALL RESERVATION SYSTEM
        </h2>
        
        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed animate-fade-in-up delay-300">
          Book your perfect football field with our easy reservation system. 
          Play, enjoy, and make memories!
        </p>
        
        {/* CTA Button */}
        <button 
          onClick={() => navigate('/booking')}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg 
                     transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                     flex items-center justify-center space-x-2 animate-fade-in-up delay-500"
        >
          <span>Get Started</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl animate-fade-in-up delay-700">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-green-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold">Easy Booking</h3>
            <p className="text-sm mt-1">Reserve in just a few clicks</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-green-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold">Secure Payments</h3>
            <p className="text-sm mt-1">Safe and reliable transactions</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-green-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold">Multiple Locations</h3>
            <p className="text-sm mt-1">Fields across the city</p>
          </div>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <span className="text-white text-2xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </span>
      </div>
    </section>
  );
};

export default HeroSection;