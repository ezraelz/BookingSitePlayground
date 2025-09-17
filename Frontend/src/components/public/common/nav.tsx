import axios from '../../../hooks/api';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

axios.defaults.withCredentials = true; 

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(()=> {
    const checkEmail = async ()=> {
    const savedEmail = localStorage.getItem('SubscribedEmail');
    if (savedEmail) {
      axios.get(`/subscribed/check/?email=${savedEmail}`)
      .then((res)=> {
        if (res.data.subscribed){
          setSubscribed(true);
        }
      }).catch(()=>{})
    }
   }
   checkEmail();
  }, []);

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Booking', path: '/booking' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <div className="text-2xl font-bold">Playground</div>

      {/* Hamburger for mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
        >
          {isOpen ? (
            <span className="text-2xl">&times;</span>
          ) : (
            <span className="text-2xl">&#9776;</span>
          )}
        </button>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex space-x-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md hover:bg-gray-800 transition ${
                isActive ? 'bg-gray-700 font-semibold' : ''
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </div>

      {subscribed ? <>
        <button 
          className="bg-green-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">Unsubscribe</button>
        </> : 
        <div className="hidden md:block">
          <NavLink
            to="/subscribe"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Subscribe
          </NavLink>
        </div>
      }
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-900 flex flex-col items-center md:hidden z-20">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `w-full text-center px-4 py-3 hover:bg-gray-800 transition ${
                  isActive ? 'bg-gray-700 font-semibold' : ''
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
          {subscribed ? <><button className="bg-green-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">Unsubscribe</button></>  :
              <NavLink
                to="/subscribe"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-red-500 hover:bg-red-600 px-4 py-3 mt-2 rounded-md transition"
              >
                Subscribe
              </NavLink>
            }
        </div>
      )}
    </nav>
  );
};

export default Nav;
