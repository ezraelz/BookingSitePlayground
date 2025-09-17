import React from "react";
import { Routes, Route } from "react-router-dom";
import Overview from "../components/admin/pages/overview";

const PublicRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Overview />} />
      </Routes>
  )
}

export default PublicRoutes