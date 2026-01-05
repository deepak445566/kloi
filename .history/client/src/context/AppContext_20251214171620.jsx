import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.timeout = 10000; // 10 seconds timeout

// Response interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const { data } = await axios.post('/api/user/refresh-token');
        if (data.success && data.token) {
          // Store new token
          localStorage.setItem('authToken', data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
          // Retry original request
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth on refresh failure
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('authChange'));
      }
    }
    
    return Promise.reject(error);
  }
);

// Create context
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Initialize auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check seller status
  const fetchSeller = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth");
      setIsSeller(data.success);
      return data.success;
    } catch (error) {
      setIsSeller(false);
      return false;
    }
  }, []);

  // Check user authentication
  const fetchUser = useCallback(async () => {
    try {
      setAuthLoading(true);
      const { data } = await axios.get('/api/user/isauth');
      
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user?.cartItems || {});
        
        // If token is returned in response, update localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        
        return { success: true, user: data.user };
      } else {
        // Clear auth on failure
        setUser(null);
        setCartItems({});
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Auth fetch error:", error);
      setUser(null);
      setCartItems({});
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      return { 
        success: false, 
        message: error.response?.data?.message || "Authentication failed" 
      };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Register user
  const registerUser = async (userData) => {
    try {
      setAuthLoading(true);
      const { data } = await axios.post('/api/user/register', userData);
      
      if (data.success) {
        // Update auth token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        
        // Fetch fresh user data
        await fetchUser();
        await fetchSeller();
        
        toast.success("Account created successfully!");
        setShowLogin(false);
        
        return { success: true, data };
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Login user
  const loginUser = async (credentials) => {
    try {
      setAuthLoading(true);
      const { data } = await axios.post('/api/user/login', credentials);
      
      if (data.success) {
        // Update auth token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        
        // Fetch fresh user data
        await fetchUser();
        await fetchSeller();
        
        toast.success("Login successful!");
        setShowLogin(false);
        
        return { success: true, data };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout user
  const logoutUser = async () => {
    try {
      await axios.post('/api/user/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      setUser(null);
      setIsSeller(false);
      setCartItems({});
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      
      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'));
      
      toast.success("Logged out successfully");
      navigate('/');
    }
  };

  // Fetch products with search and filter support
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/product/list", { 
        params: { ...filters, ...search } 
      });
      
      if (data.success) {
        setProducts(data.products);
        return data.products;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error("Products fetch error:", error);
      toast.error("Failed to load products");
      return [];
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Add to cart
  const addToCart = async (itemId, quantity = 1) => {
    // Check authentication first
    if (!user) {
      setShowLogin(true);
      toast.error("Please login to add items to cart");
      return false;
    }

    try {
      let cartData = { ...cartItems };
      const currentQuantity = cartData[itemId] || 0;
      cartData[itemId] = currentQuantity + quantity;
      
      // Optimistic update
      setCartItems(cartData);
      
      // Sync with backend
      await syncCartToBackend(cartData);
      
      toast.success(`Added ${quantity} item(s) to cart`);
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart");
      return false;
    }
  };

  // Update cart quantity
  const updateCart = async (itemId, quantity) => {
    if (!user) return false;

    try {
      let cartData = { ...cartItems };
      
      if (quantity <= 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }
      
      // Optimistic update
      setCartItems(cartData);
      
      // Sync with backend
      await syncCartToBackend(cartData);
      
      return true;
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error("Failed to update cart");
      return false;
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (!user) return false;

    try {
      let cartData = { ...cartItems };
      delete cartData[itemId];
      
      // Optimistic update
      setCartItems(cartData);
      
      // Sync with backend
      await syncCartToBackend(cartData);
      
      toast.success("Removed from cart");
      return true;
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Failed to remove item from cart");
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return false;

    try {
      // Optimistic update
      setCartItems({});
      
      // Sync with backend
      await syncCartToBackend({});
      
      toast.success("Cart cleared");
      return true;
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Failed to clear cart");
      return false;
    }
  };

  // Sync cart with backend
  const syncCartToBackend = useCallback(async (cartData) => {
    if (!user?._id) return;

    try {
      await axios.post('/api/cart/update', {
        userId: user._id,
        cartItems: cartData
      });
    } catch (error) {
      console.error("Cart sync error:", error);
      // Revert optimistic update on error
      await fetchUser();
    }
  }, [user, fetchUser]);

  // Calculate cart count
  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
  }, [cartItems]);

  // Calculate cart total
  const getCartTotal = useCallback(() => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product && cartItems[itemId] > 0) {
        const price = product.offerPrice || product.price || 0;
        total += price * cartItems[itemId];
      }
    }
    return Math.round(total * 100) / 100;
  }, [cartItems, products]);

  // Get cart items with product details
  const getCartItemsWithDetails = useCallback(() => {
    return Object.entries(cartItems).map(([itemId, quantity]) => {
      const product = products.find(p => p._id === itemId);
      return {
        ...product,
        quantity,
        totalPrice: product ? (product.offerPrice || product.price || 0) * quantity : 0
      };
    }).filter(item => item._id); // Filter out items not found in products
  }, [cartItems, products]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Check if item is in cart
  const isItemInCart = useCallback((itemId) => {
    return !!cartItems[itemId];
  }, [cartItems]);

  // Get item quantity in cart
  const getItemQuantity = useCallback((itemId) => {
    return cartItems[itemId] || 0;
  }, [cartItems]);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        // Check authentication
        const authResult = await fetchUser();
        
        if (authResult.success) {
          // Fetch seller status and products in parallel
          await Promise.all([
            fetchSeller(),
            fetchProducts()
          ]);
        } else {
          // Still fetch products for non-logged in users
          await fetchProducts();
        }
      } catch (error) {
        console.error("App initialization error:", error);
        toast.error("Failed to initialize app");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [fetchUser, fetchSeller, fetchProducts]);

  // Sync cart on changes
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      const timer = setTimeout(() => {
        syncCartToBackend(cartItems);
      }, 2000); // Debounce sync by 2 seconds

      return () => clearTimeout(timer);
    }
  }, [cartItems, user, syncCartToBackend]);

  // Handle auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      fetchUser();
      fetchSeller();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [fetchUser, fetchSeller]);

  // Handle protected routes
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/profile', '/orders', '/checkout'];
    const currentPath = location.pathname;
    
    if (protectedRoutes.some(route => currentPath.startsWith(route)) && !user) {
      navigate('/');
      setShowLogin(true);
      toast.error("Please login to access this page");
    }
  }, [location, user, navigate]);

  // Context value
  const value = {
    // State
    user,
    isSeller,
    showLogin,
    products,
    cartItems,
    search,
    loading,
    authLoading,
    notifications,
    
    // Setters
    setUser,
    setIsSeller,
    setShowLogin: (value) => {
      setShowLogin(value);
      if (!value && !user) {
        navigate('/');
      }
    },
    setProducts,
    setCartItems,
    setSearch: (value) => {
      setSearch(value);
      fetchProducts(value);
    },
    
    // Authentication
    fetchUser,
    fetchSeller,
    registerUser,
    loginUser,
    logoutUser,
    
    // Products
    fetchProducts,
    
    // Cart Operations
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    getCartItemsWithDetails,
    isItemInCart,
    getItemQuantity,
    
    // Notifications
    addNotification,
    clearNotification,
    
    // Navigation
    navigate,
    
    // Utilities
    axios
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook with error boundary
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  
  return context;
};

// Optional: HOC for protected routes
export const withAuth = (Component) => {
  return function WithAuthComponent(props) {
    const { user, setShowLogin } = useAppContext();
    
    useEffect(() => {
      if (!user) {
        setShowLogin(true);
      }
    }, [user, setShowLogin]);
    
    if (!user) {
      return null; // or a loading spinner
    }
    
    return <Component {...props} />;
  };
};

