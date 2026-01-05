import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// ✅ 1. YE LINE ADD करो (सबसे ऊपर imports के बाद)
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ 2. USER STATE को ऐसे बदलो
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  
  // ✅ CART STATE को ऐसे बदलो
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [search, setSearch] = useState({});

  //status//
  const fetchSeller = async () =>{
    try {
      const {data} = await axios.get("/api/seller/isauth");
      if(data.success){
        setIsSeller(true);
      }
      else{
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  }

  // ✅ 3. fetchUser FUNCTION को ऐसे बदलो
  const fetchUser = async () => {
    try {
      // Pehle localStorage se token check करो
      const token = localStorage.getItem('token');
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
      // Agar error aaye to localStorage clear करो
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // ✅ 4. YE DO NEW FUNCTIONS ADD करो (value object se pehle)
  const loginUser = async (email, password) => {
    try {
      const {data} = await axios.post('/api/user/login', {email, password});
      if (data.success && data.token) {
        // ✅ TOKEN को localStorage में SAVE करो
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        toast.success("Login successful!");
        return true;
      }
      toast.error(data.message || "Login failed");
      return false;
    } catch (error) {
      toast.error("Login failed");
      return false;
    }
  }

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

  // Add to cart
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
    
    console.log(cartItems);
    toast.success("Added to Cart");
  };

  // Update cart quantity
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

  // Remove product from cart completely
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
    fetchUser(); // ✅ Ye ab token check karega
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
    // ✅ YE DO FUNCTIONS ADD करो
    loginUser,
    logoutUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};