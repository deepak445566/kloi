import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { 
  Truck, Package, ShoppingBag, CreditCard, MapPin, User, 
  CheckCircle, MessageCircle, Wallet, ChevronDown, PlusCircle,
  Home, Phone, Mail, Edit
} from 'lucide-react';

const Cart = () => {
  const { products, cartItems, removeFromCart, getcount, updateCart, navigate, gettotal, axios, user, setCartItems } = useAppContext();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

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

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressDropdown(false);
    toast.success(`Address selected: ${address.firstname} ${address.lastname}`);
  };

  // Calculate product GST
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

  // Calculate total GST for cart
  const calculateTotalGST = () => {
    let totalGST = 0;
    cart.forEach(product => {
      const gstAmount = calculateProductGST(product).gstAmount;
      totalGST += gstAmount;
    });
    return totalGST;
  };

  // Calculate total shipping for cart
  const calculateTotalShipping = () => {
    let totalShipping = 0;
    cart.forEach(product => {
      const shippingCharge = calculateProductGST(product).shippingCharge;
      totalShipping += shippingCharge;
    });
    return totalShipping;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    const subtotal = gettotal();
    const totalGST = calculateTotalGST();
    const totalShipping = calculateTotalShipping();
    return subtotal + totalGST + totalShipping;
  };

  const generateWhatsAppMessage = (orderData) => {
    const { orderId, totalAmount, paymentType } = orderData;

    let gstBreakdown = "";
    cart.forEach((item, index) => {
      const gstCalc = calculateProductGST(item);
      gstBreakdown += `${index + 1}. ${item.name} (GST ${gstCalc.gstPercentage}%): ₹${gstCalc.gstAmount.toFixed(2)}\n`;
    });

    let shippingBreakdown = "";
    cart.forEach((item, index) => {
      const gstCalc = calculateProductGST(item);
      shippingBreakdown += `${index + 1}. ${item.name}: ₹${gstCalc.shippingCharge.toFixed(2)}${item.freeShipping ? ' (Free)' : ''}\n`;
    });

    const message = `🛒 *NEW ORDER RECEIVED!* 🛒

📋 *ORDER DETAILS:*
• Order ID: ${orderId}
• Customer: ${user?.name || "Customer"}
• Customer Phone: ${user?.phone || "Not provided"}
• Payment Method: ${paymentType}
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

📦 *TOTAL ITEMS:* ${cart.length}
💰 *GRAND TOTAL:* ₹${calculateGrandTotal().toFixed(2)}

_This is an automated order notification. Please process the order._`;

    return message;
  };

  const sendWhatsAppNotification = (orderId, totalAmount, paymentType) => {
    const phoneNumber = "919911577652";

    const orderData = {
      orderId,
      totalAmount,
      customerPhone: user?.phone,
      paymentType
    };

    const message = generateWhatsAppMessage(orderData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    return whatsappUrl;
  };

  // Initialize Razorpay payment
  const initRazorpayPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setRazorpayLoading(true);

    try {
      const grandTotal = calculateGrandTotal();

      // Create order on backend
      const { data: orderData } = await axios.post('/api/payment/create-order', {
        amount: grandTotal
      });

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const options = {
        key: orderData.razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Kuntal Agro Expert",
        description: "Order Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          // Payment successful, verify and place order
          await handleRazorpaySuccess(response);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#16a34a"
        },
        modal: {
          ondismiss: function () {
            setRazorpayLoading(false);
            toast("Payment cancelled");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to initialize payment");
      setRazorpayLoading(false);
    }
  };

  // Handle successful Razorpay payment
  const handleRazorpaySuccess = async (paymentResponse) => {
    setIsPlacingOrder(true);
    
    try {
      const grandTotal = calculateGrandTotal();

      // Verify payment and place order
      const { data } = await axios.post('/api/payment/verify', {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        items: cart,
        address: selectedAddress._id,
        grandTotal: grandTotal,
        subtotal: gettotal(),
        totalGST: calculateTotalGST(),
        totalShipping: calculateTotalShipping()
      });

      if (data.success) {
        // Show success message
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Payment successful! Order placed.</span>
          </div>,
          { duration: 5000 }
        );

        // Send WhatsApp notification
        try {
          const whatsappUrl = sendWhatsAppNotification(
            data.order.id,
            grandTotal,
            "Online Payment (Razorpay)"
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
        setOrderPlaced(true);

        // Redirect to orders page
        setTimeout(() => {
          navigate("/myOrders");
        }, 4000);

      } else {
        toast.error(data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error(error.response?.data?.message || error.message || "Payment verification failed");
    } finally {
      setIsPlacingOrder(false);
      setRazorpayLoading(false);
    }
  };

  // COD Order Placement (No transaction ID required)
  const placeCODOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
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
        subtotal: gettotal(),
        totalGST: calculateTotalGST(),
        totalShipping: calculateTotalShipping(),
        grandTotal: calculateGrandTotal(),
        paymentType: "COD"
      };

      const { data } = await axios.post('/api/order/cod', orderData);

      if (data.success) {
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
            "COD"
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

        setTimeout(() => {
          navigate("/myOrders");
        }, 4000);

      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Main order placement function
  const placeOrder = () => {
    if (paymentMethod === 'razorpay') {
      initRazorpayPayment();
    } else {
      placeCODOrder();
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

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            {paymentMethod === 'razorpay' 
              ? "Your payment was successful and order has been placed." 
              : "Your COD order has been placed successfully."}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Order details have been sent to the seller via WhatsApp.
          </p>

          <button
            onClick={() => navigate("/myOrders")}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition mb-3"
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Cart Items */}
        <div className='flex-1'>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Shopping Cart
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                <span className="text-green-600 font-semibold">{getcount()} Items</span> in your cart
              </p>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-4">
            {cart.map((product, index) => {
              const gstCalc = calculateProductGST(product);

              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div
                      onClick={() => {
                        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="cursor-pointer w-full sm:w-32 h-32 flex-shrink-0"
                    >
                      <img
                        className="w-full h-full object-cover rounded-lg border border-gray-300"
                        src={product.image?.[0] || assets.default_product}
                        alt={product.name}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {product.name}
                          </h3>

                          {/* Weight and Category */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {product.weightValue && product.weightUnit && (
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {product.weightValue} {product.weightUnit}
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {product.category}
                            </span>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm text-gray-700">Quantity:</span>
                            <select
                              onChange={(e) => updateCart(product._id, Number(e.target.value))}
                              value={cartItems[product._id] || 1}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Shipping Info */}
                          <div className={`text-sm ${product.freeShipping ? 'text-green-600' : 'text-blue-600'} flex items-center gap-1 mb-2`}>
                            <Truck className="w-4 h-4" />
                            {product.freeShipping ? (
                              'Free Shipping'
                            ) : (
                              `Shipping: ₹${(product.shippingCharge || 0).toFixed(2)} per item`
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col items-end gap-3">
                          {/* Price Details */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{gstCalc.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Total (GST & Shipping incl.)</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-gray-600">Base: ₹{gstCalc.subtotal.toFixed(2)}</p>
                              <p className="text-gray-600">GST: ₹{gstCalc.gstAmount.toFixed(2)}</p>
                              <p className={product.freeShipping ? 'text-green-600' : 'text-blue-600'}>
                                Shipping: ₹{gstCalc.shippingCharge.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping Button */}
          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            className="group cursor-pointer flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 mt-8 border-2 border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              Order Summary
            </h2>

            {/* Delivery Address Section - FIXED */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/add-address")}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add New
                  </button>
                  <button
                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
                    Change
                  </button>
                </div>
              </div>

              {/* Selected Address Display */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
                {selectedAddress ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {selectedAddress.firstname} {selectedAddress.lastname}
                        </p>
                        <p className="text-sm text-gray-600">{selectedAddress.street}</p>
                        <p className="text-sm text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedAddress.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/edit-address/${selectedAddress._id}`)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No address selected</p>
                    <button
                      onClick={() => navigate("/add-address")}
                      className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* Address Dropdown - FIXED */}
              {showAddressDropdown && addresses.length > 0 && (
                <div className="mt-3 border border-gray-300 rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto">
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Delivery Address:</p>
                    <div className="space-y-3">
                      {addresses.map((address, index) => (
                        <div
                          key={index}
                          onClick={() => handleAddressSelect(address)}
                          className={`p-3 rounded cursor-pointer transition ${
                            selectedAddress?._id === address._id 
                              ? 'bg-green-50 border border-green-200' 
                              : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {address.firstname} {address.lastname}
                                {selectedAddress?._id === address._id && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    Selected
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                              <p className="text-xs text-gray-500">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {address.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowAddressDropdown(false);
                        navigate("/add-address");
                      }}
                      className="w-full mt-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add New Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition ${
                    paymentMethod === 'cod' 
                      ? 'border-green-600 bg-green-50 text-green-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Wallet className="w-6 h-6 mb-2" />
                  <span className="font-medium">COD</span>
                  <span className="text-xs text-gray-500 mt-1">Cash on Delivery</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition ${
                    paymentMethod === 'razorpay' 
                      ? 'border-green-600 bg-green-50 text-green-600' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="font-medium">Online</span>
                  <span className="text-xs text-gray-500 mt-1">Card/UPI/NetBanking</span>
                </button>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({getcount()} items)</span>
                <span className="font-medium">₹{gettotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total GST</span>
                <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Shipping</span>
                <span className="font-medium">₹{calculateTotalShipping().toFixed(2)}</span>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-gray-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-800">Grand Total</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Shipping included
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">₹{calculateGrandTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Button */}
            <button
              onClick={placeOrder}
              disabled={
                isPlacingOrder || 
                razorpayLoading || 
                !selectedAddress
              }
              className={`w-full py-4 mt-4 rounded-lg font-bold text-lg transition-all ${
                isPlacingOrder || razorpayLoading || !selectedAddress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
              } text-white flex justify-center items-center`}
            >
              {isPlacingOrder || razorpayLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {paymentMethod === 'razorpay' ? 'Processing Payment...' : 'Placing Order...'}
                </>
              ) : paymentMethod === 'razorpay' ? `Pay ₹${calculateGrandTotal().toFixed(2)}` : `Place COD Order`}
            </button>

            {!selectedAddress && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Please select a delivery address
              </p>
            )}
          </div>
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
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
      >
        Start Shopping
      </button>
    </div>
  );
}

export default Cart;