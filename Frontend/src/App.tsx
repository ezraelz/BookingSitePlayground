import { Suspense, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import './index.css';

import PublicRoutes from './routes/publicRoutes'
import BaseLayout from './components/public/layout/baseLayout';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/*' element={<BaseLayout />}>
            <Route path='*' element={<PublicRoutes />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
