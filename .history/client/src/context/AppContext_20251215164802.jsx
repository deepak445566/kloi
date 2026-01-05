import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Production URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://agro-3ztp.onrender.com";

// Axios configuration - UPDATED
axios.defaults.withCredentials = true;
axios.defaults.baseURL = BACKEND_URL;

// Axios response interceptor - FIXED
axios.interceptors.response.use(
  (response) => {
    // Check if response indicates authentication failure
    if (response.data?.isAuthenticated === false) {
      // Don't treat this as error - it's just "not logged in"
      return response;
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors gracefully
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Only show toast if not on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        toast.error("Session expired. Please login again.");
      }
    }
    
    return Promise.reject(error);
  }
);

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch seller status - FIXED
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth");
      setIsSeller(data.success || false);
    } catch (error) {
      console.log("Seller not authenticated");
      setIsSeller(false);
    }
  };

  // Fetch user - COMPLETELY REWRITTEN
  const fetchUser = async (retryCount = 0) => {
    try {
      console.log('🔐 Fetching user authentication from:', BACKEND_URL);
      
      const response = await axios.get('/api/user/isauth', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Auth response:', response.data);
      
      if (response.data.success && response.data.isAuthenticated && response.data.user) {
        console.log('✅ User authenticated:', response.data.user.email);
        setUser(response.data.user);
        setCartItems(response.data.user.cartItems || {});
      } else {
        console.log('ℹ️ No authenticated user found');
        setUser(null);
        setCartItems({});
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Auth fetch error:', error.message);
      
      // Check if it's a 401 error with JSON response
      if (error.response?.status === 401 && error.response.data) {
        console.log('401 with data:', error.response.data);
        setUser(null);
        setCartItems({});
        return error.response.data;
      }
      
      setUser(null);
      setCartItems({});
      
      // Retry logic only for network errors, not 401
      if (retryCount < 2 && !error.response) {
        console.log(`Retrying auth check... (${retryCount + 1}/2)`);
        setTimeout(() => fetchUser(retryCount + 1), 1000);
        return null;
      }
      
      return {
        success: false,
        isAuthenticated: false,
        message: "Authentication check failed"
      };
    }
  };

  // Fetch products - FIXED
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("Products fetch error:", error.message);
      // Don't show toast for initial load, might be offline
      if (products.length === 0) {
        setProducts([]);
      }
    }
  };

  // Add to cart - FIXED
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
      return;
    }

    setCartItems(prev => {
      const newCart = { ...prev };
      newCart[itemId] = (newCart[itemId] || 0) + 1;
      return newCart;
    });
    
    toast.success("Added to Cart");
  };

  // Update cart quantity - FIXED
  const updateCart = (itemId, quantity) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to update cart");
      return;
    }

    setCartItems(prev => {
      const newCart = { ...prev };
      if (quantity <= 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = quantity;
      }
      return newCart;
    });
  };

  // Remove product from cart - FIXED
  const removeFromCart = (itemId) => {
    if (!user) return;

    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
    
    toast.success("Removed from Cart");
  };

  // Get cart item count
  const getcount = () => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  // Get cart total amount
  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((pro) => pro._id === itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Login function - FIXED
  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post('/api/user/login', { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.user);
        setCartItems(response.data.user?.cartItems || {});
        setShowLogin(false);
        toast.success("Login successful!");
        
        // Refresh auth status
        await fetchUser();
        
        navigate('/');
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.data.message || "Login failed" 
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 
                error.message || 
                "Login failed. Check your connection." 
      };
    }
  };

  // Register function - FIXED
  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration...');
      const response = await axios.post('/api/user/register', { 
        name, 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Register response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.user);
        setCartItems({});
        setShowLogin(false);
        toast.success("Registration successful!");
        
        // Refresh auth status
        await fetchUser();
        
        navigate('/');
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.data.message || "Registration failed" 
      };
      
    } catch (error) {
      console.error('Register error:', error);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 
                error.message || 
                "Registration failed. Check your connection." 
      };
    }
  };

  // Logout function - FIXED
  const logout = async () => {
    try {
      await axios.post('/api/user/logout');
      
      // Clear local state
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      
      toast.success("Logged out successfully");
      navigate('/');
      
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if API fails, clear local state
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      
      toast.success("Logged out successfully");
      navigate('/');
    }
  };

  // Sync cart to database - FIXED
  useEffect(() => {
    const syncCartToDB = async () => {
      if (!user?._id || Object.keys(cartItems).length === 0) return;
      
      try {
        await axios.post('/api/cart/update', {
          userId: user._id,
          cartItems
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error("Cart sync error:", error.message);
      }
    };

    if (user) {
      const timeoutId = setTimeout(syncCartToDB, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, user]);

  // Initial data fetch - FIXED
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      try {
        // First check auth
        const authResult = await fetchUser();
        
        // If authenticated, fetch other data
        if (authResult?.isAuthenticated) {
          await Promise.all([
            fetchSeller(),
            fetchProducts()
          ]);
        } else {
          // Still fetch products even if not authenticated
          await fetchProducts();
        }
        
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initializeApp();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    setProducts,
    cartItems,
    setCartItems,
    search,
    setSearch,
    loading,
    setLoading,
    authChecked,
    addToCart,
    updateCart,
    removeFromCart,
    getcount,
    gettotal,
    login,
    register,
    logout,
    fetchUser,
    fetchProducts,
    axios,
    BACKEND_URL
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};