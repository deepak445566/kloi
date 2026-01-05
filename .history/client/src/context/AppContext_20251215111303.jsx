import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// ✅ IMPORTANT: Axios configuration
const backendURL = import.meta.env.VITE_BACKEND_URL || '';

axios.defaults.baseURL = backendURL;
axios.defaults.withCredentials = true; // ✅ CRITICAL: Allows cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';

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

  // ✅ FETCH USER WITH ERROR HANDLING
  const fetchUser = async () => {
    try {
      console.log("Fetching user...");
      
      const { data } = await axios.get('/api/user/isauth', {
        withCredentials: true // ✅ Ensure cookies are sent
      });
      
      if (data.success) {
        setUser(data.user);
        console.log("User fetched successfully:", data.user.email);
      } else {
        setUser(null);
        console.log("User not authenticated:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH SELLER STATUS
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/isauth", {
        withCredentials: true
      });
      
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      console.error("Error fetching seller:", error.message);
      setIsSeller(false);
    }
  };

  // ✅ FETCH PRODUCTS
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
  };

  // ✅ UPDATE CART
  const updateCart = (itemId, quantity) => {
    let cartData = { ...cartItems };
    
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    
    setCartItems(cartData);
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = (itemId) => {
    let cartData = { ...cartItems };
    
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
  };

  // ✅ GET CART COUNT
  const getcount = () => {
    let totalcount = 0;
    for (const item in cartItems) {
      totalcount += cartItems[item];
    }
    return totalcount;
  };

  // ✅ GET TOTAL AMOUNT
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

  // ✅ UPDATE CART IN DATABASE
  useEffect(() => {
    const updateCartInDB = async () => {
      if (user && Object.keys(cartItems).length > 0) {
        try {
          await axios.post('/api/cart/update', {
            userId: user._id,
            cartItems
          });
        } catch (error) {
          console.error("Error updating cart:", error.message);
        }
      }
    };

    if (user) {
      updateCartInDB();
    }
  }, [cartItems, user]);

  // ✅ INITIAL FETCH ON MOUNT
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
    
    // ✅ Check cookies on mount
    console.log("Initializing App...");
    console.log("Backend URL:", backendURL);
    console.log("Environment:", import.meta.env.MODE);
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
    fetchUser, // ✅ Expose fetchUser for manual refresh
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook
export const useAppContext = () => {
  return useContext(AppContext);
};