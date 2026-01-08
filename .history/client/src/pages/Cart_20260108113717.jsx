import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { Truck, CheckCircle, Package, MapPin, User, MessageCircle } from 'lucide-react';

const Cart = () => {
  const { products, cartItems, removeFromCart, getcount, updateCart, navigate, gettotal, axios, user, setCartItems } = useAppContext();
  const [showAddress, setShowAddress] = useState(false);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

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
    
    // Calculate GST breakdown for WhatsApp message
    let gstBreakdown = "";
    cart.forEach((item, index) => {
      const gstCalc = calculateProductGST(item);
      gstBreakdown += `${index + 1}. ${item.name} (GST ${gstCalc.gstPercentage}%): ₹${gstCalc.gstAmount.toFixed(2)}\n`;
    });
    
    // Shipping breakdown
    let shippingBreakdown = "";
    cart.forEach((item, index) => {
      const gstCalc = calculateProductGST(item);
      shippingBreakdown += `${index + 1}. ${item.name}: ₹${gstCalc.shippingCharge.toFixed(2)}${item.freeShipping ? ' (Free)' : ''}\n`;
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
${gstBreakdown}
• Total Shipping: ₹${calculateTotalShipping().toFixed(2)}
${shippingBreakdown}
• Tax (5%): ₹${(gettotal() * 0.05).toFixed(2)}

📦 *TOTAL ITEMS:* ${cart.length}
💰 *GRAND TOTAL:* ₹${calculateGrandTotal().toFixed(2)}

_This is an automated order notification. Please process the order._`;

    return message;
  };

  const sendWhatsAppNotification = (orderId, totalAmount, transactionId) => {
    const phoneNumber = "919911577652"; // Seller's WhatsApp number
    
    const orderData = {
      orderId,
      totalAmount,
      transactionId,
      customerPhone: user?.phone
    };
    
    const message = generateWhatsAppMessage(orderData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    return whatsappUrl;
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const validationError = validateTransactionId(transactionId);
    if (validationError) {
      setTransactionError(validationError);
      toast.error(validationError);
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.offerPrice || item.price,
          gstPercentage: item.gstPercentage || 5,
          shippingCharge: item.shippingCharge || 0,
          freeShipping: item.freeShipping || false
        })),
        address: selectedAddress._id,
        transactionId: transactionId.trim(),
        subtotal: gettotal(),
        totalGST: calculateTotalGST(),
        totalShipping: calculateTotalShipping(),
        grandTotal: calculateGrandTotal(),
        paymentType: "Online Payment"
      };

      console.log("Sending order data:", orderData);

      const { data } = await axios.post('/api/order/cod', orderData);

      if (data.success) {
        // Show success message
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Order placed successfully!</span>
          </div>,
          { duration: 5000 }
        );
        
        setOrderPlaced(true);
        
        // Send WhatsApp notification
        try {
          const whatsappUrl = sendWhatsAppNotification(
            data.order._id || data.orderId, 
            calculateGrandTotal(), 
            transactionId.trim()
          );
          
          toast.success(
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp notification sent to seller
              </span>
              <span className="text-sm text-gray-600">
                Order details sent to +91 9911577652
              </span>
            </div>,
            { duration: 5000 }
          );
          
          // Auto-open WhatsApp after a short delay
          setTimeout(() => {
            window.open(whatsappUrl, '_blank');
          }, 1000);
          
        } catch (whatsappError) {
          console.error("WhatsApp notification error:", whatsappError);
          toast.error(
            <div className="flex flex-col gap-1">
              <span>Order placed successfully!</span>
              <span className="text-sm text-yellow-600">
                WhatsApp notification failed. Please contact seller manually at +91 9911577652
              </span>
            </div>,
            { duration: 5000 }
          );
        }
        
        // Clear cart
        setCartItems({});
        setCart([]);
        
        // Redirect to orders page after delay
        setTimeout(() => {
          navigate("/myOrders");
        }, 4000);
        
      } else {
        toast.error(data.message || "Failed to place order");
        setTransactionError(data.message);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to place order");
      setTransactionError(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getcart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been placed successfully. Order details have been sent to the seller via WhatsApp.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Order Amount:</span>
              <span className="text-xl font-bold text-green-600">₹{calculateGrandTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{getcount()} products</span>
            </div>
          </div>
          
          {/* WhatsApp Notification Info */}
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">WhatsApp Sent</span>
            </div>
            <p className="text-sm text-gray-600">
              Order details sent to seller at +91 9911577652
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            You will be redirected to your orders page shortly...
          </p>
          
          <button
            onClick={() => navigate("/myOrders")}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dull transition mb-3"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate("/products")}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return products.length > 0 && cartItems && cart.length > 0 ? (
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
                <div 
                  onClick={() => {
                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`); 
                    window.scrollTo(0, 0)
                  }} 
                  className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
                >
                  <img 
                    className="max-w-full h-full object-cover" 
                    src={product.image[0] || assets.default_product} 
                    alt={product.name} 
                  />
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
                        className="outline-none ml-2 bg-transparent"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}
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
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Free Shipping
                        </span>
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
              <button 
                className="cursor-pointer mx-auto hover:bg-red-50 p-2 rounded transition"
                onClick={() => removeFromCart(product._id)}
              >
                <img src={assets.remove_icon} className="inline-block w-6 h-6" alt="Remove" />
              </button>
            </div>
          );
        })}

        <button 
          onClick={() => { 
            navigate("/products"); 
            window.scrollTo(0, 0) 
          }} 
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium hover:text-primary-dull transition"
        >
          <img src={assets.arrow_right_icon_colored} className="group-hover:-translate-x-1 transition" alt="Arrow" />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivery Address
            </p>
          </div>
          <div className="relative">
            <div className="bg-white p-3 rounded border border-gray-300">
              {selectedAddress ? (
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">
                    {selectedAddress.firstname} {selectedAddress.lastname}
                  </p>
                  <p className="text-gray-600 text-sm">{selectedAddress.street}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-gray-600 text-sm">{selectedAddress.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No address found</p>
              )}
            </div>
            
            <div className="flex justify-between mt-2">
              <button 
                onClick={() => setShowAddress(!showAddress)}
                className="text-primary text-sm hover:underline cursor-pointer"
              >
                {showAddress ? 'Hide Addresses' : 'Change Address'}
              </button>
              
              {!selectedAddress && (
                <button 
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-sm hover:underline cursor-pointer"
                >
                  Add Address
                </button>
              )}
            </div>
            
            {showAddress && addresses.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white border border-gray-300 rounded shadow-lg z-10">
                {addresses.map((add, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedAddress(add);
                      setShowAddress(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <p className="text-sm font-medium text-gray-800">{add.firstname} {add.lastname}</p>
                    <p className="text-xs text-gray-600 truncate">{add.street}, {add.city}</p>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2">
                  <button 
                    onClick={() => navigate("/add-address")}
                    className="w-full text-center text-primary text-sm font-medium px-3 py-2 hover:bg-primary/5 transition"
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction ID Input */}
          <div className="mt-6">
            <p className="text-sm font-medium uppercase mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Transaction ID *
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  setTransactionError(validateTransactionId(e.target.value));
                }}
                placeholder="Enter payment transaction ID"
                className={`w-full border ${transactionError ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 outline-none rounded transition`}
              />
              {transactionError && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {transactionError}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Enter the transaction ID from your payment confirmation (UPI/Net Banking)
              </p>
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
                <div key={index} className="flex justify-between items-center text-xs mb-1">
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  <div className="text-right">
                    <span>({gstCalc.gstPercentage}%): ₹{gstCalc.gstAmount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total GST</span>
            <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
          </div>
          
          {/* Shipping Breakdown */}
          <div className="pl-4 border-l-2 border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Shipping Breakdown:</p>
            {cart.map((item, index) => {
              const gstCalc = calculateProductGST(item);
              return (
                <div key={index} className="flex justify-between items-center text-xs mb-1">
                  <span className="truncate max-w-[120px]">
                    {item.name} 
                    {item.freeShipping && <span className="text-green-600 ml-1">(Free)</span>}
                  </span>
                  <span className={item.freeShipping ? 'text-green-600' : ''}>
                    {item.freeShipping ? '₹0.00' : `₹${gstCalc.shippingCharge.toFixed(2)}`}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Shipping</span>
            <span className="font-medium">₹{calculateTotalShipping().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-300">
            <span>Grand Total:</span>
            <span className="text-2xl text-primary">₹{calculateGrandTotal().toFixed(2)}</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Prices are inclusive of all taxes
            </p>
            <p className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free shipping on eligible products
            </p>
          </div>
        </div>

        {/* Secure Payment Image */}
        <div className="mt-4 mb-2 text-center">
          <img
            src="/qr.jpg"
            alt="Secure Payment"
            className="w-60 h-60 mx-auto border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">Scan QR for payment</p>
        </div>

        {/* WhatsApp Notification Info */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-700 text-sm">WhatsApp Notification</p>
          </div>
          <p className="text-xs text-gray-600">
            After placing order, order details will be automatically sent to seller's WhatsApp (+91 9911577652)
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={isPlacingOrder || !transactionId || transactionError || !selectedAddress}
          className={`w-full py-3 mt-2 cursor-pointer rounded-lg ${
            isPlacingOrder || !transactionId || transactionError || !selectedAddress
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
              Processing & Sending WhatsApp...
            </>
          ) : `Pay ₹${calculateGrandTotal().toFixed(2)} & Place Order`}
        </button>
        
        {(!transactionId || !selectedAddress) && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {!selectedAddress ? 'Please select a delivery address' : 'Please enter transaction ID'}
          </p>
        )}
        
        {/* Order Information */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Order Process</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Enter transaction ID after payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Order confirmation sent via WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Track order in "My Orders" section</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
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
  );
}

export default Cart;