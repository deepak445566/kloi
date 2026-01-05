import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { user, setUser, setShowLogin, setSearch, search, getcount, axios, fetchUser } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (search.length > 0) {
      navigate("/products")
    }
  }, [search, navigate])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('nav')) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout", {
        withCredentials: true
      });
      
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        setShowProfileMenu(false);
        
        // Clear search
        setSearch("");
        
        // Navigate to home
        navigate('/');
        
        // Refresh user state
        setTimeout(() => {
          fetchUser();
        }, 100);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || error.message || "Logout failed");
    }
  };

  const handleMyOrders = () => {
    navigate("/myOrders");
    setShowProfileMenu(false);
    setOpen(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setOpen(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-2 border-b border-gray-300 bg-white relative transition-all z-50">

        {/* Logo */}
        <NavLink to='/' onClick={() => setOpen(false)} className="flex items-center">
          <img src="/logo1.png" alt="logo" className='h-15 w-15 object-contain' />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `hover:text-primary transition-colors ${isActive ? 'text-primary font-medium' : 'text-gray-700'}`
            }
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/products" 
            className={({ isActive }) => 
              `hover:text-primary transition-colors ${isActive ? 'text-primary font-medium' : 'text-gray-700'}`
            }
          >
            All Products
          </NavLink>
          
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `hover:text-primary transition-colors ${isActive ? 'text-primary font-medium' : 'text-gray-700'}`
            }
          >
            Contact
          </NavLink>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 py-1.5 rounded-full">
            <input 
              onChange={(e) => setSearch(e.target.value)} 
              value={search}
              className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-700" 
              type="text" 
              placeholder="Search products" 
            />
            <img src={assets.search_icon} className='w-4 h-4 opacity-70' alt="Search" />
          </div>

          {/* Cart Icon */}
          <div 
            onClick={() => navigate("/cart")} 
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src={assets.nav_cart_icon} className='w-6 opacity-80' alt="Cart" />
            {getcount() > 0 && (
              <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {getcount()}
              </button>
            )}
          </div>

          {/* User Menu */}
          {!user ? (
            <button 
              onClick={() => setShowLogin(true)} 
              className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-full text-sm font-medium"
            >
              Login
            </button>
          ) : (
            <div className='relative'>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity'
              >
                <img 
                  src={assets.profile_icon} 
                  className='w-8 h-8 rounded-full border border-gray-300 p-1' 
                  alt="Profile" 
                />
                <span className="text-sm text-gray-700 hidden md:block">
                  Hi, {user.name?.split(' ')[0] || 'User'}
                </span>
              </div>
              
              {showProfileMenu && (
                <div className='absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-2 w-40 rounded-md text-sm z-50'>
                  <div className='px-4 py-2 border-b border-gray-100'>
                    <p className='font-medium text-gray-800 truncate'>{user.name}</p>
                    <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={handleMyOrders}
                    className='w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700'
                  >
                    My Orders
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-red-600 font-medium'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className='flex items-center gap-6 sm:hidden'>
          {/* Mobile Search */}
          <div className="lg:hidden flex items-center text-sm gap-2 border border-gray-300 px-3 py-1.5 rounded-full">
            <input 
              onChange={(e) => setSearch(e.target.value)} 
              value={search}
              className="w-24 bg-transparent outline-none placeholder-gray-500 text-sm" 
              type="text" 
              placeholder="Search..." 
            />
            <img src={assets.search_icon} className='w-3 h-3 opacity-70' alt="Search" />
          </div>

          {/* Cart Icon - Mobile */}
          <div 
            onClick={() => navigate("/cart")} 
            className="relative cursor-pointer"
          >
            <img src={assets.nav_cart_icon} className='w-6 opacity-80' alt="Cart" />
            {getcount() > 0 && (
              <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {getcount()}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setOpen(!open)} 
            aria-label="Menu"
            className='p-1 hover:bg-gray-100 rounded transition-colors'
          >
            <img 
              src={open ? assets.cross_icon : assets.menu_icon} 
              className='w-6 h-6' 
              alt={open ? "Close Menu" : "Open Menu"} 
            />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`${
            open ? 'flex' : 'hidden'
          } absolute top-full left-0 w-full bg-white shadow-lg py-4 flex-col items-start gap-2 px-5 text-sm md:hidden z-40 border-t border-gray-200`}
        >
          <NavLink 
            to="/" 
            onClick={() => setOpen(false)}
            className={({ isActive }) => 
              `w-full px-3 py-2 rounded ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50'}`
            }
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/products" 
            onClick={() => setOpen(false)}
            className={({ isActive }) => 
              `w-full px-3 py-2 rounded ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50'}`
            }
          >
            All Products
          </NavLink>
          
          {user && (
            <button 
              onClick={handleMyOrders}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-gray-700"
            >
              My Orders
            </button>
          )}
          
          <NavLink 
            to="/contact" 
            onClick={() => setOpen(false)}
            className={({ isActive }) => 
              `w-full px-3 py-2 rounded ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50'}`
            }
          >
            Contact
          </NavLink>

          {/* User Info in Mobile Menu */}
          {user && (
            <div className='w-full px-3 py-3 border-t border-gray-100 mt-2'>
              <p className='font-medium text-gray-800'>{user.name}</p>
              <p className='text-xs text-gray-500'>{user.email}</p>
            </div>
          )}

          {/* Auth Buttons - Mobile */}
          <div className='w-full px-3 mt-2'>
            {!user ? (
              <button 
                onClick={handleLoginClick}
                className="w-full py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm font-medium"
              >
                Login / Register
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>

      </nav>

      {/* Close dropdown when clicking outside (for profile menu) */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
}

export default Navbar;