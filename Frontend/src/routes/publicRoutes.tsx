import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../components/public/home";

const PublicRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
  )
}

export default PublicRoutes