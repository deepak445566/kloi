import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Axios configuration for Vercel
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://agro-3ztp.onrender.com";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios error:", error.response?.status, error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear user state if token is invalid
      const context = window.__APP_CONTEXT__;
      if (context && context.setUser) {
        context.setUser(null);
      }
      
      // Show toast only if not on login page
      if (!window.location.pathname.includes('/login')) {
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

  // Store context globally for interceptor access
  useEffect(() => {
    window.__APP_CONTEXT__ = { setUser };
    return () => {
      delete window.__APP_CONTEXT__;
    };
  }, []);

  // Fetch user authentication status
  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log("Fetching user auth status...");
      
      const { data } = await axios.get('/api/user/isauth', {
        timeout: 10000
      });
      
      if (data.success && data.isAuthenticated) {
        console.log("User authenticated:", data.user.email);
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        setIsSeller(data.user.isSeller || false);
      } else {
        console.log("User not authenticated:", data.message);
        setUser(null);
        setCartItems({});
        setIsSeller(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      
      // Don't show toast for expected 401 errors
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        toast.error("Failed to check authentication status");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      console.error("Error fetching seller status:", error.message);
      setIsSeller(false);
    }
  };

  // Login function
  const loginUser = async (email, password) => {
    try {
      const { data } = await axios.post('/api/user/login', {
        email,
        password
      });
      
      if (data.success) {
        toast.success("Login successful!");
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        setShowLogin(false);
        return { success: true, user: data.user };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const registerUser = async (name, email, password) => {
    try {
      const { data } = await axios.post('/api/user/register', {
        name,
        email,
        password
      });
      
      if (data.success) {
        toast.success("Registration successful!");
        setUser(data.user);
        setCartItems({});
        setShowLogin(false);
        return { success: true, user: data.user };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logoutUser = async () => {
    try {
      await axios.post('/api/user/logout');
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      toast.success("Logged out successfully");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error.message);
      toast.error("Failed to load products");
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      setShowLogin(true);
      return;
    }

    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Update cart quantity
  const updateCart = (itemId, quantity) => {
    let cartData = { ...cartItems };
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  // Remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
  };

  // Get cart count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  };

  // Get cart total
  const getCartTotal = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product && cartItems[itemId] > 0) {
        total += (product.offerPrice || product.price || 0) * cartItems[itemId];
      }
    }
    return Math.round(total * 100) / 100;
  };

  // Update cart in database
  const updateCartInDB = async () => {
    if (!user) return;
    
    try {
      await axios.post('/api/cart/update', {
        userId: user._id,
        cartItems
      });
    } catch (error) {
      console.error("Error updating cart in DB:", error.message);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchUser();
    fetchProducts();
  }, []);

  // Update cart in database when cartItems change
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      updateCartInDB();
    }
  }, [cartItems, user]);

  const value = {
    // State
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    cartItems,
    setCartItems,
    search,
    setSearch,
    loading,
    
    // Functions
    navigate,
    addToCart,
    updateCart,
    removeFromCart,
    getCartCount,
    getCartTotal,
    loginUser,
    registerUser,
    logoutUser,
    fetchUser,
    fetchProducts,
    fetchSeller,
    axios
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};