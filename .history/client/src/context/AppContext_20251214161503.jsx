import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ✅ 1. AXIOS INTERCEPTOR ADD करो (सबसे ऊपर)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ 2. USER STATE को localStorage से initialize करो
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  
  // ✅ 3. CART STATE को localStorage से initialize करो
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  
  const [search, setSearch] = useState({});

  //status//
  const fetchSeller = async () => {
    try {
      const {data} = await axios.get("/api/seller/isauth");
      if(data.success){
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  }

  // ✅ 4. UPDATED fetchUser function
  const fetchUser = async () => {
    try {
      const {data} = await axios.get('/api/user/isauth');
      if(data.success){
        setUser(data.user);
        
        // ✅ USER को localStorage में SAVE करो
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if(data.user.cartItems){
          setCartItems(data.user.cartItems);
          // ✅ CART को भी localStorage में SAVE करो
          localStorage.setItem('cart', JSON.stringify(data.user.cartItems));
        }
      }
    } catch (error) {
      setUser(null);
      // Error aaye to localStorage clear करो
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // ✅ 5. NEW: Login function jo token save karegi
  const loginUser = async (email, password) => {
    try {
      const {data} = await axios.post('/api/user/login', {email, password});
      
      if(data.success){
        // ✅ TOKEN को localStorage में SAVE करो (Response से)
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log("✅ Token saved to localStorage:", data.token.substring(0, 20) + "...");
        }
        
        // ✅ USER को localStorage में SAVE करो
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        
        toast.success("Login successful!");
        return { success: true };
      }
      toast.error(data.message || "Login failed");
      return { success: false };
    } catch (error) {
      toast.error("Login failed");
      return { success: false };
    }
  }

  // ✅ 6. NEW: Register function
  const registerUser = async (name, email, password) => {
    try {
      const {data} = await axios.post('/api/user/register', {name, email, password});
      
      if(data.success){
        // ✅ TOKEN को localStorage में SAVE करो
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // ✅ USER को localStorage में SAVE करो
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        
        toast.success("Registration successful!");
        return { success: true };
      }
      toast.error(data.message || "Registration failed");
      return { success: false };
    } catch (error) {
      toast.error("Registration failed");
      return { success: false };
    }
  }

  // ✅ 7. NEW: Logout function
  const logoutUser = async () => {
    try {
      await axios.get('/api/user/logout');
    } catch (error) {
      console.log(error);
    }
    
    // ✅ LOCALSTORAGE CLEAN करो
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    setUser(null);
    setCartItems({});
    setIsSeller(false);
    
    toast.success("Logged out");
    navigate('/');
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      const {data} = await axios.get("/api/product/list");
      if(data.success){
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch(error) {
      toast.error(error.message);
    }
  };

  // Add to cart - WITH LOCALSTORAGE SAVE
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    
    // ✅ CART को localStorage में SAVE करो
    localStorage.setItem('cart', JSON.stringify(cartData));
    
    toast.success("Added to Cart");
  };

  // Update cart quantity - WITH LOCALSTORAGE SAVE
  const updateCart = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    
    // ✅ CART को localStorage में SAVE करो
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  // Remove product from cart - WITH LOCALSTORAGE SAVE
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      
      // ✅ CART को localStorage में SAVE करो
      localStorage.setItem('cart', JSON.stringify(cartData));
      
      toast.success("Removed from Cart");
    }
  };

  const getcount = () => {
    let totalcount = 0;
    for (const item in cartItems) {
      totalcount += cartItems[item];
    }
    return totalcount;
  };

  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      let itemInfo = products.find((pro) => pro._id === itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchSeller();
    fetchUser();
    fetchProducts();
  }, []);

  //database cart items//
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post('/api/cart/update', {
          userId: user._id,
          cartItems
        });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if(user){
      updateCart();
    }
  }, [cartItems]);

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
    updateCart,
    removeFromCart,
    cartItems,
    search,
    setSearch,
    getcount,
    gettotal,
    axios,
    fetchProducts,
    setCartItems,
    // ✅ 8. YE NEW FUNCTIONS ADD करो
    loginUser,
    registerUser,
    logoutUser,
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};