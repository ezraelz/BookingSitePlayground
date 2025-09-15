import React from 'react'
import Nav from '../common/nav'
import { Outlet } from 'react-router-dom'
import Footer from '../common/footer'

const BaseLayout = () => {
  return (
    <div>
        <Nav />
        <div className="">
            <Outlet />
        </div>
        <Footer />
    </div>
  )
}

export default BaseLayout