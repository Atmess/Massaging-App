import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/picture/image1.png';
import home from '../assets/picture/home.png';
import dashboard from '../assets/picture/Untitled.jpg';
import message from '../assets/picture/massage.png';
import task from '../assets/picture/task.png';
import card from '../assets/picture/code.png';

export default function SideHeader() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: home },
    { name: 'Dashboard', path: '/dashboard', icon: dashboard },
    { name: 'Post', path: '/posts', icon: task },
    { name: 'Card', path: '/shop', icon: card },
    { name: 'Message', path: '/message', icon: message },
  ];

  return (
    <aside className="sticky top-0 h-screen w-16 bg-white border-r border-stone-200 shadow-md z-50 flex flex-col items-center justify-between py-6 px-2">
      {/* TOP SECTION: Logo & Navigation Links */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center group relative">
          <img src={logo} alt="logo" className="h-10 w-10 object-contain" />
          {/* Logo Hover Tooltip */}
          <span className="absolute left-full ml-3 hidden group-hover:block bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
            Messaging App
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col items-center gap-3 w-full">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex justify-center w-full"
            >
              <button className="flex items-center justify-center p-2.5 rounded-xl hover:bg-stone-100 transition w-full">
                <img src={item.icon} alt={item.name} className="h-8 w-8 object-contain" />
              </button>

              {/* Hover Tooltip Label */}
{/* Hover Tooltip Label */}
<span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-2xl whitespace-nowrap z-100 pointer-events-none border border-slate-700">
  {item.name}
</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* BOTTOM SECTION: User Profile & Dropdown / Login */}
      <div className="relative pt-4 border-t border-stone-200 w-full flex flex-col items-center">
        {user ? (
          <div className="w-full flex flex-col items-center">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="group relative flex items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-stone-100 transition w-full"
            >
              <img
                src={user.avatarUrl || logo}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover border border-slate-600 shrink-0"
              />
              {/* Profile Hover Label */}
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                {user.username || 'Profile'}
              </span>
            </div>

            {/* Popup Dropdown Menu for Logout */}
            {showDropdown && (
              <div className="absolute left-full bottom-0 ml-3 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-2">
                <Link to="/UserProfile" className="w-full">
                  <button className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition text-sm font-medium">
                    User Profile
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="group relative flex justify-center w-full"
          >
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition text-xs font-medium shadow w-full">
              🔑
            </button>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
              Log In
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}