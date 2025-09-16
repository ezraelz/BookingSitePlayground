import React from 'react';
import bg from '../../../assets/images/soccer-afl-01-v1.jpg';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div
      className="w-full p-16 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative  p-10 z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeIn">
          Welcome to PlayRent!
        </h1>
        <p className="text-white text-base sm:text-lg md:text-2xl mb-8 animate-fadeIn delay-200">
          Here to Reserve a playground 
        </p>
        <button 
          onClick={()=> navigate(`booking/`)}
          className="bg-green-500 
                     hover:bg-green-600 
                    text-white px-6 py-3 
                    rounded-lg transition 
                    transform hover:scale-105">
          Get Started
        </button>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <span className="text-white text-2xl">⌄</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
