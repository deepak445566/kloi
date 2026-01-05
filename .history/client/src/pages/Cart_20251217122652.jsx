import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const { products, currency, cartItems, removeFromCart, getcount, updateCart, navigate, gettotal, axios, user, setCartItems } = useAppContext();
  const [showAddress, setShowAddress] = useState(false);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [transactionId, setTransactionId] = useState(""); // ✅ Transaction ID state
  const [transactionError, setTransactionError] = useState(""); // ✅ Error state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // ✅ Loading state

  const getcart = () => {
    let temp = []
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key)
      if (product) {
        temp.push({
          ...product,
          quantity: cartItems[key]
        })
      }
    }
    setCart(temp)
  }

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error(error.message);
    }
  }

  const validateTransactionId = (id) => {
    if (!id || id.trim() === '') {
      return "Transaction ID is required";
    }
    if (id.trim().length < 8) {
      return "Transaction ID must be at least 8 characters";
    }
    return "";
  }

  const placeOrder = async () => {
    // Validations
    if (!selectedAddress) {
      return toast.error("Please select an address");
    }

    const validationError = validateTransactionId(transactionId);
    if (validationError) {
      setTransactionError(validationError);
      return toast.error(validationError);
    }

    setIsPlacingOrder(true);
    try {
      const { data } = await axios.post('/api/order/cod', {
      
        items: cart.map(item => ({ product: item._id, quantity: item.quantity })),
        address: selectedAddress._id,
        transactionId: transactionId.trim()
      });

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        navigate("/myOrders");
      } else {
        toast.error(data.message);
        setTransactionError(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
      setTransactionError(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getcart()
    }
  }, [products, cartItems])

  useEffect(() => {
    if (user) {
      getUserAddress()
    }
  }, [user])

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-12">
      <div className='flex-1 max-w-4xl'>
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-primary">{getcount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cart.map((product, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
            <div className="flex items-center md:gap-6 gap-3">
              <div onClick={() => {
                navigate(`/products/${product.category.toLowerCase()}/${product._id}`); window.scrollTo(0, 0)
              }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>Weight: <span>{product.weight || "N/A"}</span></p>
                  <div className='flex items-center'>
                    <p>Qty:</p>
                    <select
                      onChange={(e) => updateCart(product._id, Number(e.target.value))}
                      value={cartItems[product._id] || 1}
                      className="outline-none"
                    >
                      {Array(5)
                        .fill('')
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">₹{product.offerPrice * product.quantity}</p>
            <button className="cursor-pointer mx-auto" onClick={() => removeFromCart(product._id)}>
              <img src={assets.remove_icon} className="inline-block w-6 h-6" alt="Remove" />
            </button>
          </div>
        ))}

        <button onClick={() => { navigate("/products"); window.scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
          <img src={assets.arrow_right_icon_colored} className="group-hover:-translate-x-1 transition" alt="Arrow" />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
            <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {addresses.map((add, index) => (
                  <p
                    key={index}
                    onClick={() => {
                      setSelectedAddress(add);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {add.street}, {add.city}, {add.state}
                  </p>
                ))}
                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                  Add address
                </p>
              </div>
            )}
          </div>

          {/* ✅ Transaction ID Input - Only for Online Payment */}
          <div className="mt-6">
            <p className="text-sm font-medium uppercase mb-2">Transaction ID *</p>
            <div className="space-y-2">
              <input
                type="text"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  setTransactionError(validateTransactionId(e.target.value));
                }}
                placeholder="Enter your payment transaction ID"
                className={`w-full border ${transactionError ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 outline-none rounded`}
              />
              {transactionError && (
                <p className="text-red-500 text-sm">{transactionError}</p>
              )}
              <p className="text-xs text-gray-500">
                ⚠️ Enter the transaction ID from your payment confirmation. This is required to process your order.
              </p>
            </div>
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <div className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none text-gray-700">
            Online Payment Only
          </div>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span><span>₹{gettotal()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span><span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (5%)</span><span>₹{Math.floor(gettotal() * 0.05)}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span><span>₹{gettotal() + Math.floor(gettotal() * 0.05)}</span>
          </p>
        </div>

        {/* Secure Payment Image */}
        <div className="mt-4 mb-2 text-center">
          <img
            src="/qr.jpg"
            alt="Secure Payment"
            className="w-60 h-70 mx-auto "
          />
          <p className="text-xs text-gray-500 mt-1">100% Secure Online Payment</p>
        </div>

        <button
          onClick={placeOrder}
          disabled={isPlacingOrder || !transactionId || transactionError}
          className={`w-full py-3 mt-2 cursor-pointer ${isPlacingOrder || !transactionId || transactionError ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dull'} text-white font-medium transition flex justify-center items-center`}
        >
          {isPlacingOrder ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Place Order'}
        </button>
      </div>
    </div>
  ) : null
}

export default Cart