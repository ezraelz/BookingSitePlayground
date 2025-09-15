import React from 'react'
import Nav from '../common/nav'
import { Outlet } from 'react-router-dom'

const BaseLayout = () => {
  return (
    <div>
        <Nav />
        <div className="">
            <Outlet />
        </div>
    </div>
  )
}

export default BaseLayout