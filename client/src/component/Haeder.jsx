import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/picture/image1.png';
import home from '../assets/picture/home.png';
import dashboard from '../assets/picture/Untitled.jpg';
import message from '../assets/picture/massage.png';
import task from '../assets/picture/task.png';
import card from '../assets/picture/code.png';

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <aside className="sticky top-0 h-screen w-20 bg-white border-r border-stone-200 shadow-md z-50 flex flex-col items-center justify-between py-6 px-2">
      {/* TOP SECTION: Logo & Navigation Links */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center">
            <img src={logo} alt="logo" className="h-10 w-10 object-contain" />
          </Link>
        </div>

        {/* Navigation Links (Stacked Vertically & Centered) */}
        <nav className="flex flex-col items-center gap-3 w-full">
          <Link to="/" className="w-flex flex justify-center w-full">
            <button className="flex items-center justify-center p-2 rounded-xl hover:bg-stone-100 transition w-full">
              <img src={home} alt="home" className="h-8 w-8 object-contain" />
            </button>
          </Link>
          <Link to="/dashboard" className="flex justify-center w-full">
            <button className="flex items-center justify-center p-2 rounded-xl hover:bg-stone-100 transition w-full">
              <img src={dashboard} alt="dashboard" className="h-8 w-8 object-contain" />
            </button>
          </Link>
          <Link to="/posts" className="flex justify-center w-full">
            <button className="flex items-center justify-center p-2 rounded-xl hover:bg-stone-100 transition w-full">
              <img src={task} alt="task" className="h-8 w-8 object-contain" />
            </button>
          </Link>
          <Link to="/shop" className="flex justify-center w-full">
            <button className="flex items-center justify-center p-2 rounded-xl hover:bg-stone-100 transition w-full">
              <img src={card} alt="card" className="h-8 w-8 object-contain" />
            </button>
          </Link>
          <Link to="/message" className="flex justify-center w-full">
            <button className="flex items-center justify-center p-2 rounded-xl hover:bg-stone-100 transition w-full">
              <img src={message} alt="message" className="h-8 w-8 object-contain" />
            </button>
          </Link>
        </nav>
      </div>

      {/* BOTTOM SECTION: User Profile & Dropdown / Login */}
      <div className="relative pt-4 border-t border-stone-200 w-full flex flex-col items-center">
        {user ? (
          <div className="w-full flex flex-col items-center">
            {/* Clickable user avatar box */}
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-stone-100 transition w-full"
            >
              <img
                src={user.avatarUrl || logo}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover border border-slate-600 shrink-0"
              />
            </div>

            {/* Popup Dropdown Menu for Logout (positioned to the right of the sidebar) */}
            {showDropdown && (
              <div className="absolute left-full bottom-0 ml-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-2">
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
            className="block text-center bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition text-xs font-medium shadow w-full truncate"
          >
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}