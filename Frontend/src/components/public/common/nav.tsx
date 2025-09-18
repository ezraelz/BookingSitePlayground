import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Home as HomeIcon,
  Compass,
  Calendar,
  Cog,
  Info,
  Mail,
  Menu,
  X,
  CalendarDays,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

<<<<<<< HEAD
axios.defaults.withCredentials = true; 

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loggedin, setLoggedin] = useState(false);
  const role = localStorage.getItem('role');

  console.log('role', role);

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
   const checkStatus = async () => {
    const username = localStorage.getItem('username');
    if (username){
      axios.get(`/login/check/?username=${username}`)
      .then((res)=> {
        if (res.data.loggedin){
          setLoggedin(true);
        } else {
        }
      }).catch(()=>{})
    }
   }
   checkEmail();
   checkStatus();
  }, []);

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Booking', path: '/booking' },
    { name: 'Services', path: '/services' },
    { name: 'Schedules', path: '/schedules' },
    { name: 'Contact', path: '/contact' },
    { name: role === 'admin' ? 'Dashboard' : '', path: role === 'admin' ? '/dashboard' : '' },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between relative">
      {/* Logo */}
      <div className="text-2xl font-bold">WUB C0URTYARD</div>

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

      <div className="hidden md:block">
        <NavLink
          to={loggedin ? '/signout' : "/login"}
          className={loggedin ? "bg-green-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition" : "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"}
        >
          {loggedin ? 'Signout': 'SignIn'}
        </NavLink>
      </div>
      
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
=======
type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
>>>>>>> 847639dbb7c1a3575a0476fed68858a5df8e32e1
};

const items: Item[] = [
  { to: '/',         label: 'Home',     icon: HomeIcon, end: true },
  { to: '/explore',  label: 'Explore',  icon: Compass },
  { to: '/booking',  label: 'Booking',  icon: CalendarDays },
  { to: '/services', label: 'Services', icon: Cog },
  { to: '/about',    label: 'About',    icon: Info },
  { to: '/contact',  label: 'Contact',  icon: Mail },
];

function NavInner() {
  const [open, setOpen] = React.useState(false);

  const linkClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
    }`;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2" aria-label="PlayGround Home">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-extrabold text-transparent">
              PlayGround
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}

            {/* Sign in */}
            <Link
              to="/login"
              className="ml-2 inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-controls="mobile-nav"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur"
            aria-label="Primary mobile"
          >
            <div className="mx-auto max-w-7xl px-2 py-2">
              <div className="grid grid-cols-3 gap-1">
                {items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 rounded-lg p-2 text-xs ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </NavLink>
                ))}
                {/* Sign in */}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-indigo-700 border border-indigo-200 hover:bg-indigo-50"
                >
                  <span>Sign in</span>
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* Named export */
export function NavBar() {
  return <NavInner />;
}

/* Default export (so `import Nav from '../common/nav'` works) */
export default function Nav() {
  return <NavInner />;
}
