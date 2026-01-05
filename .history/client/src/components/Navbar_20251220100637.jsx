import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  
  const {
    user,
    setUser,
    setShowLogin,
    navigate,
    setSearch,
    search,
    getcount,
    axios
  } = useAppContext()

  useEffect(() => {
    if (search.length > 0) {
      navigate("/products")
    }
  }, [search, navigate])

  const handleLogout = async () => {
    // Close mobile menu if open
    setOpen(false)
    setLoggingOut(true)
    
    try {
      // ✅ POST request use करें GET के बजाय
      const { data } = await axios.post("/api/user/logout", {}, {
        withCredentials: true
      })
      
      if (data.success) {
        toast.success(data.message || "Logged out successfully")
        
        // Clear user state
        setUser(null)
        
        // Optional: Clear cart items
        // setCartItems({})
        
        // Navigate to home
        navigate('/')
        
        // Force page reload to clear all state (optional)
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        toast.error(data.message || "Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      
      // Show appropriate error message
      if (error.response?.status === 401) {
        toast.error("Session already expired")
      } else {
        toast.error(error.response?.data?.message || error.message || "Network error")
      }
      
      // Still clear local state even if API fails
      setUser(null)
      navigate('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleProfileClick = () => {
    setOpen(false)
    // Add profile page navigation if you have one
    // navigate('/profile')
  }

  const handleOrdersClick = () => {
    setOpen(false)
    navigate('/myOrders')
  }

  const handleLoginClick = () => {
    setOpen(false)
    setShowLogin(true)
  }

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 py-2 border-b border-gray-300 bg-white relative transition-all z-40">
        {/* Logo */}
        <NavLink to='/' onClick={() => setOpen(false)}>
          <img src="/logo1.png" className='h-15 w-15' alt="Logo" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/" className="hover:text-primary transition">Home</NavLink>
          <NavLink to="/products" className="hover:text-primary transition">All Products</NavLink>
           <NavLink to="/contact" className="hover:text-primary transition">Contact</NavLink>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input 
              onChange={(e) => setSearch(e.target.value)} 
              value={search}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" 
              type="text" 
              placeholder="Search products" 
            />
            <img src={assets.search_icon} className='w-4 h-4' alt="Search" />
          </div>

          {/* Cart Icon */}
          <div 
            onClick={() => { navigate("/cart"); setOpen(false) }} 
            className="relative cursor-pointer hover:opacity-80 transition"
          >
            <img src={assets.nav_cart_icon} className='w-6' alt="Cart" />
            {getcount() > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {getcount()}
              </span>
            )}
          </div>

          {/* User Section */}
          {!user ? (
            <button 
              onClick={handleLoginClick}
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className='relative group'>
              <img 
                src={assets.profile_icon} 
                className='w-10 cursor-pointer hover:opacity-80 transition' 
                alt="Profile" 
              />
              <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-2 w-40 rounded-md text-sm z-40'>
               
                <li 
                  onClick={handleOrdersClick}
                  className='px-4 py-2 hover:bg-primary/10 cursor-pointer transition'
                >
                  My Orders
                </li>
                <li 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`px-4 py-2 hover:bg-primary/10 cursor-pointer transition ${
                    loggingOut ? 'text-gray-400 cursor-not-allowed' : ''
                  }`}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Menu Icons */}
        <div className='flex items-center gap-6 sm:hidden'>
          {/* Cart Icon (Mobile) */}
          <div 
            onClick={() => { navigate("/cart"); setOpen(false) }} 
            className="relative cursor-pointer"
          >
            <img src={assets.nav_cart_icon} className='w-6' alt="Cart" />
            {getcount() > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {getcount()}
              </span>
            )}
          </div>
          
          {/* Hamburger Menu */}
          <button 
            onClick={() => setOpen(!open)} 
            aria-label="Menu"
            className="p-2"
          >
            <img src={open ? assets.close_icon || assets.menu_icon : assets.menu_icon} alt="Menu" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`
          ${open ? 'flex' : 'hidden'} 
          absolute top-[60px] left-0 w-full bg-white shadow-lg py-4 flex-col items-start gap-3 px-5 text-sm md:hidden
          border-t border-gray-200
        `}>
          <NavLink 
            to="/" 
            onClick={() => setOpen(false)}
            className="w-full py-2 hover:text-primary transition"
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/products" 
            onClick={() => setOpen(false)}
            className="w-full py-2 hover:text-primary transition"
          >
            All Products
          </NavLink>
          
          {user && (
            <NavLink 
              to="/myOrders" 
              onClick={() => setOpen(false)}
              className="w-full py-2 hover:text-primary transition"
            >
              My Orders
            </NavLink>
          )}
          
           <NavLink to="/" onClick={() => setOpen(false)}>Contact</NavLink>

          {/* Mobile Search Bar */}
          <div className="w-full flex items-center gap-2 border border-gray-300 px-3 rounded-full mt-2">
            <input 
              onChange={(e) => setSearch(e.target.value)} 
              value={search}
              className="py-2 w-full bg-transparent outline-none placeholder-gray-500" 
              type="text" 
              placeholder="Search products" 
            />
            <img src={assets.search_icon} className='w-4 h-4' alt="Search" />
          </div>

          {/* Mobile Auth Buttons */}
          <div className="w-full mt-3 space-y-2">
            {!user ? (
              <button 
                onClick={handleLoginClick}
                className="w-full cursor-pointer px-6 py-3 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm"
              >
                Login
              </button>
            ) : (
              <>
                <button 
                  onClick={handleOrdersClick}
                  className="w-full cursor-pointer px-6 py-3 bg-gray-100 hover:bg-gray-200 transition text-gray-700 rounded-full text-sm"
                >
                  My Orders
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full cursor-pointer px-6 py-3 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-sm ${
                    loggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar