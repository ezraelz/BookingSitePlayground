import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../components/public/home";
import Reserve from "../components/public/pages/reserve";
import AboutUs from "../components/public/pages/aboutUs";
import Booking from "../components/public/pages/booking";
import Services from "../components/public/pages/services";
import Subscribe from "../components/public/pages/subscribe";
import Blog from "../components/public/pages/blog";
import Contact from "../components/public/pages/contact";
import SignIn from "../components/public/pages/signin";
import SignUp from "../components/public/pages/signup";
import SignOut from "../components/public/pages/signout";

const PublicRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="booking" element={<Booking />} />
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        <Route path="blog" element={<Blog />} />
        <Route path="subscribe" element={<Subscribe />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="signout" element={<SignOut />} />
        <Route path="reserve/:id" element={<Reserve />} />
      </Routes>
  )
}

export default PublicRoutes