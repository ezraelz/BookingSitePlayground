import React from 'react'
import Nav from '../common/nav'
import { Outlet } from 'react-router-dom'
import Footer from '../common/footer'

const BaseLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      {/* Pad the top to clear the fixed navbar (h-16 ≈ 64px). Adjust if your header height changes. */}
      <main id="main" className="flex-1 pt-20 md:pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default BaseLayout
