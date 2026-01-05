import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ IMPORTANT: Production vs Development URLs
const getBackendURL = () => {
  // Check if we're in production
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // Production backend URL
    return import.meta.env.VITE_BACKEND_URL || 'https://your-backend-api.vercel.app';
  } else {
    // Development backend URL
    return 'http://localhost:3000';
  }
};

const backendURL = getBackendURL();

console.log("🚀 Backend URL:", backendURL);
console.log("🚀 Environment:", import.meta.env.MODE);
console.log("🚀 Current URL:", window.location.href);

// ✅ AXIOS CONFIGURATION
axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true; // ✅ CRITICAL for cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log("📤 Request:", {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error("📤 Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log("📥 Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error("📥 Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ FETCH USER WITH RETRY LOGIC
  const fetchUser = async (retryCount = 0) => {
    try {
      console.log("🔍 Fetching user... Attempt:", retryCount + 1);
      
      const { data } = await axios.get('/api/user/isauth', {
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      
      console.log("✅ User fetch response:", data);
      
      if (data.success) {
        setUser(data.user);
        console.log("✅ User authenticated:", data.user.email);
      } else {
        setUser(null);
        console.log("❌ User not authenticated:", data.message);
      }
      
      setAuthChecked(true);
    } catch (error) {
      console.error("❌ Error fetching user:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        retryCount
      });
      
      // Retry logic (max 3 retries)
      if (retryCount < 3) {
        console.log(`🔄 Retrying user fetch (${retryCount + 1}/3)...`);
        setTimeout(() => fetchUser(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setUser(null);
        setAuthChecked(true);
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  // ✅ CHECK COOKIES ON PAGE LOAD
  const checkCookies = () => {
    console.log("🍪 Browser Cookies:", document.cookie);
    console.log("🌐 Current Origin:", window.location.origin);
  };

  // ✅ FETCH SELLER STATUS
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth");
      setIsSeller(data.success);
    } catch (error) {
      console.error("Seller fetch error:", error);
      setIsSeller(false);
    }
  };

  // ✅ FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Products fetch error:", error);
    }
  };

  // ✅ ADD TO CART
  const addToCart = (itemId) => {
    let cartData = { ...cartItems };
    
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    
    setCartItems(cartData);
    toast.success("Added to Cart");
    
    // Save to localStorage as backup
    localStorage.setItem('cartItems', JSON.stringify(cartData));
  };

  // ✅ LOAD CART FROM LOCALSTORAGE
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // ✅ SAVE CART TO LOCALSTORAGE
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✅ UPDATE CART IN DATABASE WHEN USER LOGS IN
  useEffect(() => {
    const syncCartWithDB = async () => {
      if (user && Object.keys(cartItems).length > 0) {
        try {
          await axios.post('/api/cart/update', {
            userId: user._id,
            cartItems
          });
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      }
    };

    if (user) {
      syncCartWithDB();
    }
  }, [user, cartItems]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    console.log("🚀 App Initializing...");
    checkCookies();
    
    // Fetch all initial data
    Promise.all([
      fetchUser(),
      fetchSeller(),
      fetchProducts()
    ]).then(() => {
      console.log("✅ All initial data loaded");
    });
    
    // Check auth on page focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    
    document.addEventListener('visibilitychange', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // ✅ VALUE OBJECT
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    addToCart,
    updateCart: (itemId, quantity) => {
      let cartData = { ...cartItems };
      if (quantity <= 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }
      setCartItems(cartData);
    },
    removeFromCart: (itemId) => {
      let cartData = { ...cartItems };
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    },
    cartItems,
    search,
    setSearch,
    getcount: () => {
      return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
    },
    gettotal: () => {
      let total = 0;
      for (const [itemId, quantity] of Object.entries(cartItems)) {
        const product = products.find(p => p._id === itemId);
        if (product) {
          total += product.offerPrice * quantity;
        }
      }
      return Math.floor(total * 100) / 100;
    },
    axios,
    fetchProducts,
    setCartItems,
    fetchUser,
    loading,
    authChecked
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);