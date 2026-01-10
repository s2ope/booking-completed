import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Menu,
  ChevronDown,
  LogOut,
  User,
  Bookmark,
  CreditCard,
  BookOpen,
  Award,
  Bell,
  HelpCircle,
  Check,
} from "lucide-react";
import { showToast } from "../../helpers/ToastHelper";

// Logo Component
const Logo = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      className={`h-9 w-auto ${className}`} // Taller than other elements
      role="img"
      aria-label="Mamabooking Logo"
    >
      <title>Mamabooking Logo</title>

      {/* Square with more pronounced rounded corners like Booking.com */}
      <rect x="20" y="15" width="65" height="65" rx="12" fill="#FFFFFF" />

      {/* Bold M Letter */}
      <text
        x="35"
        y="63"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900" // Extra bold
        fontSize="45"
        fill="#01357F"
        letterSpacing="-1"
      >
        M
      </text>

      {/* Mamabooking Text - Bold and prominent */}
      <text
        x="100"
        y="63"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900" // Extra bold
        fontSize="44"
        fill="#FFFFFF"
        letterSpacing="-0.5" // Tighter letter spacing like Booking.com
      >
        Mamabooking
      </text>
    </svg>
  );
};

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    showToast("Logged out successfully!", "success");
    setIsOpen(false);
  };

  const menuItems = [
    { icon: BookOpen, label: "My Bookings", path: "/my-bookings" },
    { icon: User, label: "My Account", path: "/my-account" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
  ];

  const notifications = [
    { message: "You have a new booking!", href: "/bookings" },
    {
      message: "There is a special offer on hotels in Paris!",
      href: "/hotels/paris",
    },
  ];

  return (
    <nav className="bg-[#01357F] shadow">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-14">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white font-bold text-lg">
              <Logo />
            </Link>
          </div>

          {/* Notification icon */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-white hover:text-gray-300 p-1.5 relative"
            >
              <Bell className="h-5 w-5" />
              {showNotifications && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded shadow-lg py-1 z-50">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.message}
                      to={notification.href}
                      className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                    >
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {notification.message}
                    </Link>
                  ))}
                </div>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 p-1.5"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 text-white px-3 py-1.5 rounded-md hover:bg-[#012b68] transition-colors"
                >
                  <span className="text-sm">{user.username}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg py-1 z-50">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-3 w-3 mr-2" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-3 w-3 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1.5 rounded text-white font-bold hover:bg-[#214F9F]">
                    NPR
                  </span>

                  <HelpCircle className="h-6 w-6 text-white font-bold hover:bg-[#214F9F] p-0.5 m-1 rounded" />
                </div>
                <a
                  href="https://mern-admin-ten.vercel.app/login/login.jsx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#214F9F]"
                >
                  List Your Property
                </a>

                <Link
                  to="/register"
                  className="bg-white text-[#01357F] px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-[#01357F] px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#012b68]">
          {user ? (
            <div className="px-2 pt-1.5 pb-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center text-white px-2 py-1.5 rounded text-sm hover:bg-[#01357F]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-3 w-3 mr-2" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center text-white px-2 py-1.5 rounded text-sm hover:bg-[#01357F]"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="px-2 pt-1.5 pb-2 space-y-1">
              <Link
                to="/register"
                className="block bg-white text-[#01357F] px-2 py-1.5 rounded text-sm text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="block bg-white text-[#01357F] px-2 py-1.5 rounded text-sm text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
