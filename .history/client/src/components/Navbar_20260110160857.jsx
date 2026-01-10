import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaHome, FaSeedling, FaPhoneAlt, FaSignOutAlt, FaBoxOpen } from 'react-icons/fa'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [localSearch, setLocalSearch] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sync local search with context search
  useEffect(() => {
    if (typeof search === 'string') {
      setLocalSearch(search)
    } else {
      setLocalSearch("")
    }
  }, [search])

  useEffect(() => {
    if (localSearch && localSearch.trim().length > 0) {
      navigate("/products")
    }
  }, [localSearch, navigate])

  const handleLogout = async () => {
    setOpen(false)
    setLoggingOut(true)
    
    try {
      const { data } = await axios.post("/api/user/logout", {}, {
        withCredentials: true
      })
      
      if (data.success) {
        toast.success(data.message || "Logged out successfully")
        setUser(null)
        if (typeof setSearch === 'function') {
          setSearch("")
        }
        setLocalSearch("")
        navigate('/')
      } else {
        toast.error(data.message || "Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error(error.response?.data?.message || error.message || "Network error")
      setUser(null)
      if (typeof setSearch === 'function') {
        setSearch("")
      }
      setLocalSearch("")
      navigate('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleOrdersClick = () => {
    setOpen(false)
    navigate('/myOrders')
  }

  const handleLoginClick = () => {
    setOpen(false)
    setShowLogin(true)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    if (typeof setSearch === 'function') {
      setSearch(value)
    }
  }

  const handleClearSearch = () => {
    setLocalSearch("")
    if (typeof setSearch === 'function') {
      setSearch("")
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (localSearch.trim()) {
      navigate("/products")
      setOpen(false)
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-sm py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <NavLink 
              to='/' 
              onClick={() => {
                setOpen(false)
                handleClearSearch()
              }}
              className="flex items-center space-x-2"
            >
              <div className=" w-15 h-15 flex items-center justify-center shadow-lg">
              <img src="logo1.png"/>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Kuntal</span>
                <span className="text-sm font-semibold text-green-700 -mt-1">Agro Expert</span>
              </div>
            </NavLink>
<div className='flex  gap-10'>
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-5">
              <NavLink 
                to="/" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === '/' 
                    ? 'text-green-700 bg-green-50 font-semibold' 
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50/50'
                }`}
                onClick={handleClearSearch}
              >
                <FaHome className="text-sm" />
                <span>Home</span>
              </NavLink>
              
              <NavLink 
                to="/products" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname.startsWith('/products') 
                    ? 'text-green-700 bg-green-50 font-semibold' 
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50/50'
                }`}
                onClick={handleClearSearch}
              >
                <FaSeedling className="text-sm" />
                <span>Products</span>
              </NavLink>
              
              <NavLink 
                to="/contact" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === '/contact' 
                    ? 'text-green-700 bg-green-50 font-semibold' 
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50/50'
                }`}
                onClick={handleClearSearch}
              >
                <FaPhoneAlt className="text-sm" />
                <span>Contact</span>
              </NavLink>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input 
                    onChange={handleSearchChange}
                    value={localSearch}
                    className="w-64 px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="text" 
                    placeholder="Search products..." 
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {localSearch && (
                    <button 
                      onClick={handleClearSearch}
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <div 
                onClick={() => { 
                  navigate("/cart"); 
                  setOpen(false); 
                  handleClearSearch();
                }} 
                className="relative cursor-pointer group"
              >
                <div className="p-2 rounded-full bg-gray-50 hover:bg-green-50 transition-all group-hover:scale-110">
                  <FaShoppingCart className="text-gray-700 group-hover:text-green-700 text-lg" />
                </div>
                {getcount() > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs text-white bg-gradient-to-r from-red-500 to-red-600 w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {getcount()}
                  </span>
                )}
              </div>

              {/* User Actions */}
              {!user ? (
                <button 
                  onClick={handleLoginClick}
                  className="hidden lg:block px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Login
                </button>
              ) : (
                <div className="hidden lg:block relative group">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 cursor-pointer group-hover:scale-110 transition-transform">
                    <FaUser className="text-green-700" />
                  </div>
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email || 'user@example.com'}</p>
                    </div>
                    <button 
                      onClick={handleOrdersClick}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-green-50 transition-colors"
                    >
                      <FaBoxOpen className="text-gray-600" />
                      <span className="text-gray-700">My Orders</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="text-red-600" />
                      <span className={`text-red-600 ${loggingOut ? 'opacity-50' : ''}`}>
                        {loggingOut ? 'Logging out...' : 'Logout'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setOpen(!open)} 
                aria-label="Menu"
                className="lg:hidden p-2 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
              >
                {open ? <FaTimes className="text-gray-700" /> : <FaBars className="text-gray-700" />}
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`
          lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl
          transform transition-all duration-300 ease-in-out
          ${open ? 'translate-y-0 opacity-100 visible' : '-translate-y-2 opacity-0 invisible'}
        `}>
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input 
                  onChange={handleSearchChange}
                  value={localSearch}
                  className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  type="text" 
                  placeholder="Search products..." 
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {localSearch && (
                  <button 
                    onClick={handleClearSearch}
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Menu Links */}
            <NavLink 
              to="/" 
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname === '/' 
                  ? 'bg-green-50 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaHome />
              <span>Home</span>
            </NavLink>
            
            <NavLink 
              to="/products" 
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname.startsWith('/products') 
                  ? 'bg-green-50 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaSeedling />
              <span>All Products</span>
            </NavLink>
            
            {user && (
              <button 
                onClick={handleOrdersClick}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FaBoxOpen />
                <span>My Orders</span>
              </button>
            )}
            
            <NavLink 
              to="/contact" 
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname === '/contact' 
                  ? 'bg-green-50 text-green-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaPhoneAlt />
              <span>Contact Us</span>
            </NavLink>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {!user ? (
                <button 
                  onClick={handleLoginClick}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Login / Sign Up
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user.email || 'user@example.com'}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all ${
                      loggingOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>
    </>
  )
}

export default Navbar