import React from "react";
import { Routes, Route } from "react-router-dom";
import Overview from "../components/admin/pages/overview";
import Users from "../components/admin/pages/users/users";
import AddUser from "../components/admin/pages/users/addusers";
import UserDetail from "../components/admin/pages/users/userdetail";
import Timeslot from "../components/admin/pages/timeslot/timeslot";
import Bookings from "../components/admin/pages/bookings";
import Payments from "../components/admin/pages/payments";
import Playground from "../components/admin/pages/playgrounds/fields";
import Analytics from "../components/admin/pages/analytics";
import Settings from "../components/admin/pages/settings";
import AddPlayground from "../components/admin/pages/playgrounds/addFields";

const AdminRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/detail/:id" element={<UserDetail />} />

        <Route path="/timeslots" element={<Timeslot />} />
        <Route path="/bookings" element={< Bookings />} />
        <Route path="/payments" element={< Payments />} />
        <Route path="/playgrounds" element={< Playground />} />
        <Route path="/playgrounds/add" element={< AddPlayground />} />

        <Route path="/analytics" element={< Analytics />} />
        <Route path="/settings" element={< Settings />} />

      </Routes>
  )
}

export default AdminRoutes