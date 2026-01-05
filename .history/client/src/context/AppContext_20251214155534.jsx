import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ AXIOS CONFIGURATION में ये ADD करो
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ✅ TOKEN को हर request के साथ भेजने के लिए
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

  // ✅ USER STATE को localStorage से initialize करो
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  
  // ✅ CART STATE को localStorage से initialize करो
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  
  const [search, setSearch] = useState({});

  // ✅ UPDATED fetchUser - TOKEN को localStorage से लो
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Agar token nahi hai to API call mat karo
      if (!token) {
        setUser(null);
        return;
      }
      
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
      // ✅ Agar error aaye to localStorage clear kar do
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // ✅ NEW: LOGIN FUNCTION जो TOKEN SAVE करेगी
  const loginUser = async (email, password) => {
    try {
      const {data} = await axios.post('/api/user/login', {email, password});
      
      if(data.success && data.token){
        // ✅ TOKEN को localStorage में SAVE करो
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // User state update करो
        setUser(data.user);
        
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false };
      }
    } catch (error) {
      toast.error("Login failed");
      return { success: false };
    }
  };

  // ✅ NEW: REGISTER FUNCTION
  const registerUser = async (name, email, password) => {
    try {
      const {data} = await axios.post('/api/user/register', {name, email, password});
      
      if(data.success && data.token){
        // ✅ TOKEN को localStorage में SAVE करो
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        toast.success("Registration successful!");
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error("Registration failed");
      return { success: false };
    }
  };

  // ✅ NEW: LOGOUT FUNCTION
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
  };

  // Add to cart function में LOCALSTORAGE SAVE करो
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

  // Update cart function में भी LOCALSTORAGE SAVE करो
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

  // Remove from cart में भी LOCALSTORAGE SAVE करो
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

  useEffect(() => {
    // App start pe user check करो
    fetchSeller();
    fetchUser(); // ✅ Ye ab token check karega
    fetchProducts();
  }, []);

  // Database cart update
  useEffect(() => {
    const updateCartToDB = async () => {
      if (user && user._id) {
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
      }
    };

    if(user){
      updateCartToDB();
    }
  }, [cartItems, user]);

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
    // ✅ NEW FUNCTIONS ADD करो
    loginUser,
    registerUser,
    logoutUser,
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};