import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios to handle cookies properly
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Add this interceptor to handle CORS cookies
axios.interceptors.request.use(
  (config) => {
    // Ensure cookies are sent with every request
    config.withCredentials = true;
    return config;
  },
  (error) => {
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

  // Fetch user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/isauth');
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch (error) {
      setUser(null);
      setCartItems({});
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
      toast.error("Error logging out");
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
      toast.error(error.message);
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
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

  // Remove product from cart completely
  const removeFromCart = (itemId) => {
    let cartData = { ...cartItems };
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
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

  // Update cart in database
  const updateCartInDB = async () => {
    if (!user) return;
    
    try {
      const { data } = await axios.post('/api/cart/update', {
        userId: user._id,
        cartItems
      });
      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  // Update cart in database when cartItems change
  useEffect(() => {
    if (user && Object.keys(cartItems).length > 0) {
      updateCartInDB();
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
    logoutUser,
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};