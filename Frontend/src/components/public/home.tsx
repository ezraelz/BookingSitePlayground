import React from 'react';
import HeroSection from './pages/herosection';
import Playgrounds from './pages/playgrounds';
import AboutUs from './pages/aboutUs';
import Booking from './pages/booking';
import Services from './pages/services';

const Home = () => {
  return (
    <div className="">
      <HeroSection />
      <Playgrounds />
      <AboutUs />
      <Services />
      <Booking />
    </div>
  )
}

export default Home