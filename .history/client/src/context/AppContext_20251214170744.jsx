import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "https://your-backend-api.vercel.app";

// Create context
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
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);

  // Set token in axios headers and localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    }
    setAuthToken(token);
  };

  // Clear authentication
  const clearAuth = () => {
    setToken(null);
    setUser(null);
    setIsSeller(false);
    setCartItems({});
  };

  // Check seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth");
      setIsSeller(data.success);
    } catch (error) {
      setIsSeller(false);
    }
  };

  // Check user authentication
  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/user/isauth');
      
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        // If token was sent in response, store it
        if (data.token) {
          setToken(data.token);
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Auth fetch error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const registerUser = async (userData) => {
    try {
      const { data } = await axios.post('/api/user/register', userData);
      
      if (data.success) {
        // Store token if provided
        if (data.token) {
          setToken(data.token);
        }
        
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        
        // Fetch fresh user data
        await fetchUser();
        
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  // Login user
  const loginUser = async (credentials) => {
    try {
      const { data } = await axios.post('/api/user/login', credentials);
      
      if (data.success) {
        // Store token if provided
        if (data.token) {
          setToken(data.token);
        }
        
        setUser(data.user);
        
        // Fetch fresh user data with cart items
        await fetchUser();
        
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  // Logout user
  const logoutUser = async () => {
    try {
      await axios.post('/api/user/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate('/');
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
      console.error("Products fetch error:", error);
      toast.error("Failed to load products");
    }
  };

  // Add to cart
  const addToCart = async (itemId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    let cartData = { ...cartItems };
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
    
    // Sync with backend
    await syncCartToBackend(cartData);
    
    toast.success("Added to Cart");
  };

  // Update cart quantity
  const updateCart = async (itemId, quantity) => {
    if (!user) return;

    let cartData = { ...cartItems };
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    
    // Sync with backend
    await syncCartToBackend(cartData);
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (!user) return;

    let cartData = { ...cartItems };
    delete cartData[itemId];
    setCartItems(cartData);
    
    // Sync with backend
    await syncCartToBackend(cartData);
    
    toast.success("Removed from Cart");
  };

  // Sync cart with backend
  const syncCartToBackend = async (cartData) => {
    if (!user) return;

    try {
      await axios.post('/api/cart/update', {
        userId: user._id,
        cartItems: cartData
      });
    } catch (error) {
      console.error("Cart sync error:", error);
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
        total += (product.offerPrice || product.price) * cartItems[itemId];
      }
    }
    return Math.round(total * 100) / 100;
  };

  // Initialize on mount
  useEffect(() => {
    // Set token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setToken(token);
    }
    
    // Fetch initial data
    fetchUser();
    fetchProducts();
    fetchSeller();
  }, []);

  // Sync cart when cartItems change
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      const timer = setTimeout(() => {
        syncCartToBackend(cartItems);
      }, 1000); // Debounce sync

      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

  const value = {
    // State
    user,
    isSeller,
    showLogin,
    products,
    cartItems,
    search,
    loading,
    authToken,
    
    // Setters
    setUser,
    setIsSeller,
    setShowLogin,
    setProducts,
    setCartItems,
    setSearch,
    
    // Functions
    navigate,
    fetchUser,
    fetchProducts,
    fetchSeller,
    registerUser,
    loginUser,
    logoutUser,
    addToCart,
    updateCart,
    removeFromCart,
    getCartCount,
    getCartTotal,
    
    // Utilities
    axios
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};