import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../components/public/home";
import Reserve from "../components/public/pages/reserve";

const PublicRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="reserve/:id" element={<Reserve />} />
      </Routes>
  )
}

export default PublicRoutes