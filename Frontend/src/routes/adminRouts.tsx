import React from "react";
import { Routes, Route } from "react-router-dom";
import Overview from "../components/admin/pages/overview";
import Users from "../components/admin/pages/users/users";
import AddUser from "../components/admin/pages/users/addusers";

const AdminRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />

      </Routes>
  )
}

export default AdminRoutes