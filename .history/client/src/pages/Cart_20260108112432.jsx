import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const { products, cartItems, removeFromCart, getcount, updateCart, navigate, gettotal, axios, user, setCartItems } = useAppContext();
  const [showAddress, setShowAddress] = useState(false);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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

  // ✅ Calculate GST for each product
  const calculateProductGST = (product) => {
    const gstPercentage = product.gstPercentage || 5;
    const basePrice = product.offerPrice || product.price || 0;
    const quantity = product.quantity || 1;
    
    const subtotal = basePrice * quantity;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const shippingCharge = product.freeShipping ? 0 : (product.shippingCharge || 0) * quantity;
    
    return {
      subtotal,
      gstAmount,
      shippingCharge,
      total: subtotal + gstAmount + shippingCharge,
      gstPercentage
    };
  };

  // ✅ Calculate total GST for cart
  const calculateTotalGST = () => {
    let totalGST = 0;
    cart.forEach(product => {
      const gstAmount = calculateProductGST(product).gstAmount;
      totalGST += gstAmount;
    });
    return totalGST;
  };

  // ✅ Calculate total shipping for cart
  const calculateTotalShipping = () => {
    let totalShipping = 0;
    cart.forEach(product => {
      const shippingCharge = calculateProductGST(product).shippingCharge;
      totalShipping += shippingCharge;
    });
    return totalShipping;
  };

  // ✅ Calculate grand total with GST and Shipping
  const calculateGrandTotal = () => {
    const subtotal = gettotal();
    const totalGST = calculateTotalGST();
    const totalShipping = calculateTotalShipping();
    return subtotal + totalGST + totalShipping;
  };

  const validateTransactionId = (id) => {
    if (!id || id.trim() === '') {
      return "Transaction ID is required";
    }
    if (id.trim().length < 8) {
      return "Transaction ID must be at least 8 characters";
    }
    return "";
  };

  const generateWhatsAppMessage = (orderData) => {
    const { orderId, totalAmount, transactionId, customerPhone } = orderData;
    
    let shippingBreakdown = "";
    cart.forEach((item, index) => {
      const gstCalc = calculateProductGST(item);
      shippingBreakdown += `${index + 1}. ${item.name}: ₹${gstCalc.shippingCharge.toFixed(2)}\n`;
    });
    
    const message = `🛒 *NEW ORDER RECEIVED!* 🛒

📋 *ORDER DETAILS:*
• Order ID: ${orderId}
• Customer: ${user?.name || "Customer"}
• Customer Phone: ${customerPhone || user?.phone || "Not provided"}
• Payment: Online
• Transaction ID: ${transactionId}
• Order Time: ${new Date().toLocaleString('en-IN', { 
  timeZone: 'Asia/Kolkata',
  dateStyle: 'full',
  timeStyle: 'medium'
})}

📍 *DELIVERY ADDRESS:*
${selectedAddress ? 
  `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}\n📞 ${selectedAddress.phone || "No phone"}` 
  : "Address not provided"}

🛍️ *ORDER ITEMS:*
${cart.map((item, index) => {
  const gstCalc = calculateProductGST(item);
  return `${index + 1}. ${item.name} x ${item.quantity} = ₹${item.offerPrice * item.quantity} (GST ${gstCalc.gstPercentage}%: ₹${gstCalc.gstAmount.toFixed(2)}, Shipping: ₹${gstCalc.shippingCharge.toFixed(2)})`;
}).join('\n')}

📊 *PRICE BREAKDOWN:*
• Subtotal: ₹${gettotal().toFixed(2)}
• Total GST: ₹${calculateTotalGST().toFixed(2)}
• Total Shipping: ₹${calculateTotalShipping().toFixed(2)}
${shippingBreakdown}
• Tax (5%): ₹${(gettotal() * 0.05).toFixed(2)}

📦 *TOTAL ITEMS:* ${cart.length}
💰 *GRAND TOTAL:* ₹${calculateGrandTotal().toFixed(2)}

_This is an automated order notification. Please process the order._`;

    return message;
  };

  // ... rest of the placeOrder function remains same ...

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

        {cart.map((product, index) => {
          const gstCalc = calculateProductGST(product);
          
          return (
            <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3 border-b pb-4">
              <div className="flex items-center md:gap-6 gap-3">
                <div onClick={() => {
                  navigate(`/products/${product.category.toLowerCase()}/${product._id}`); 
                  window.scrollTo(0, 0)
                }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                  <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                </div>
                <div>
                  <p className="hidden md:block font-semibold">{product.name}</p>
                  <div className="font-normal text-gray-500/70">
                    <p>Weight: <span>{product.weightValue} {product.weightUnit}</span></p>
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
                    <div className="text-xs text-green-600 mt-1">
                      Includes {gstCalc.gstPercentage}% GST: ₹{gstCalc.gstAmount.toFixed(2)}
                    </div>
                    {/* ✅ Shipping Charge Display */}
                    <div className={`text-xs mt-1 ${product.freeShipping ? 'text-green-600' : 'text-blue-600'}`}>
                      {product.freeShipping ? (
                        "✓ Free Shipping"
                      ) : (
                        `Shipping: ₹${(product.shippingCharge || 0).toFixed(2)} per item`
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">₹{gstCalc.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">(Total incl. GST & Shipping)</p>
                <div className="text-sm space-y-1 mt-1">
                  <p>Base: ₹{gstCalc.subtotal.toFixed(2)}</p>
                  <p>GST: ₹{gstCalc.gstAmount.toFixed(2)}</p>
                  <p className={product.freeShipping ? 'text-green-600' : ''}>
                    Shipping: ₹{gstCalc.shippingCharge.toFixed(2)}
                  </p>
                </div>
              </div>
              <button className="cursor-pointer mx-auto" onClick={() => removeFromCart(product._id)}>
                <img src={assets.remove_icon} className="inline-block w-6 h-6" alt="Remove" />
              </button>
            </div>
          );
        })}

        <button onClick={() => { 
          navigate("/products"); 
          window.scrollTo(0, 0) 
        }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
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
            <p className="text-gray-500">
              {selectedAddress ? 
                `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` 
                : "No address found"
              }
            </p>
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

          {/* Transaction ID Input */}
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
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Subtotal ({getcount()} items)</span>
            <span>₹{gettotal().toFixed(2)}</span>
          </p>
          
          {/* GST Breakdown */}
          <div className="pl-4 border-l-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">GST Breakdown:</p>
            {cart.map((item, index) => {
              const gstCalc = calculateProductGST(item);
              return (
                <p key={index} className="flex justify-between text-xs">
                  <span>{item.name} ({gstCalc.gstPercentage}%)</span>
                  <span>₹{gstCalc.gstAmount.toFixed(2)}</span>
                </p>
              );
            })}
          </div>
          
          <p className="flex justify-between border-t pt-2">
            <span className="font-medium">Total GST</span>
            <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
          </p>
          
          {/* Shipping Breakdown */}
          <div className="pl-4 border-l-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Shipping Breakdown:</p>
            {cart.map((item, index) => {
              const gstCalc = calculateProductGST(item);
              return (
                <p key={index} className="flex justify-between text-xs">
                  <span>
                    {item.name} 
                    {item.freeShipping && <span className="text-green-600 ml-1">(Free)</span>}
                  </span>
                  <span className={item.freeShipping ? 'text-green-600' : ''}>
                    {item.freeShipping ? '₹0.00' : `₹${gstCalc.shippingCharge.toFixed(2)}`}
                  </span>
                </p>
              );
            })}
          </div>
          
          <p className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Shipping</span>
            <span className="font-medium">₹{calculateTotalShipping().toFixed(2)}</span>
          </p>
          
          <p className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-300">
            <span>Grand Total:</span>
            <span className="text-2xl text-primary">₹{calculateGrandTotal().toFixed(2)}</span>
          </p>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>✓ Prices are inclusive of all taxes</p>
            <p>✓ Free shipping on eligible products</p>
          </div>
        </div>

        {/* Secure Payment Image */}
        <div className="mt-4 mb-2 text-center">
          <img
            src="/qr.jpg"
            alt="Secure Payment"
            className="w-60 h-60 mx-auto"
          />
          <p className="text-xs text-gray-500 mt-1">100% Secure Online Payment</p>
        </div>

        <button
          onClick={placeOrder}
          disabled={isPlacingOrder || !transactionId || transactionError}
          className={`w-full py-3 mt-2 cursor-pointer ${
            isPlacingOrder || !transactionId || transactionError 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-dull'
          } text-white font-medium transition flex justify-center items-center`}
        >
          {isPlacingOrder ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : `Pay ₹${calculateGrandTotal().toFixed(2)} & Place Order`}
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src={assets.empty_cart} alt="Empty Cart" className="w-64 h-64 opacity-50" />
      <h2 className="text-2xl font-semibold text-gray-500 mt-6">Your cart is empty</h2>
      <p className="text-gray-400 mt-2">Add some products to your cart</p>
      <button 
        onClick={() => {
          navigate("/products");
          window.scrollTo(0, 0);
        }}
        className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition"
      >
        Start Shopping
      </button>
    </div>
  )
}

export default Cart;