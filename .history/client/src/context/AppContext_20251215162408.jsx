import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Axios configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Axios response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Handle token expiration
      if (window.location.pathname !== '/login') {
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
      setIsSeller(false);
    }
  };

  // Fetch user with retry logic
  const fetchUser = async (retryCount = 0) => {
    try {
      console.log('Fetching user authentication...');
      const { data } = await axios.get('/api/user/isauth');
      
      if (data.success && data.user) {
        console.log('User authenticated:', data.user.email);
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        console.log('No authenticated user found');
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.error('Auth fetch error:', error.message);
      setUser(null);
      setCartItems({});
      
      // Retry logic for initial load
      if (retryCount < 2) {
        setTimeout(() => fetchUser(retryCount + 1), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("Products fetch error:", error.message);
      toast.error("Failed to load products. Please try again.");
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
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
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to update cart");
      return;
    }

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
    if (!user) return;

    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
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

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/user/login', { email, password });
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        setShowLogin(false);
        toast.success("Login successful!");
        navigate('/');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post('/api/user/register', { name, email, password });
      if (data.success) {
        setUser(data.user);
        setCartItems({});
        setShowLogin(false);
        toast.success("Registration successful!");
        navigate('/');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/user/logout');
      setUser(null);
      setCartItems({});
      setIsSeller(false);
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Sync cart to database
  useEffect(() => {
    const syncCartToDB = async () => {
      if (!user?._id) return;
      
      try {
        await axios.post('/api/cart/update', {
          userId: user._id,
          cartItems
        });
      } catch (error) {
        console.error("Cart sync error:", error.message);
      }
    };

    if (user) {
      const timeoutId = setTimeout(syncCartToDB, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, user]);

  // Initial data fetch
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await Promise.all([
        fetchUser(),
        fetchSeller(),
        fetchProducts()
      ]);
      setLoading(false);
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
    axios
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};