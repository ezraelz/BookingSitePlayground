import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../components/public/home";
import Reserve from "../components/public/pages/reserve";
import AboutUs from "../components/public/pages/aboutUs";
import Booking from "../components/public/pages/booking";
import Services from "../components/public/pages/services";
import Subscribe from "../components/public/pages/subscribe";

const PublicRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="booking" element={<Booking />} />
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Home />} />
        <Route path="subscribe" element={<Subscribe />} />
        <Route path="reserve/:id" element={<Reserve />} />
      </Routes>
  )
}

export default PublicRoutes