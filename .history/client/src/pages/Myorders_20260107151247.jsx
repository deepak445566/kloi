import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { 
  Package, Truck, Clock, CheckCircle, XCircle, 
  RefreshCw, MapPin, Phone, Calendar, CreditCard,
  ExternalLink, ChevronDown, ChevronUp, AlertCircle,
  ShoppingBag, Shield, Mail, Navigation, Target,
  ArrowRight, Download, Printer, Copy, Eye,
  TrendingUp, TrendingDown, BarChart, Loader2,
  DollarSign, Box, CheckSquare, AlertTriangle,
  Info, HelpCircle, MessageSquare, FileText,
  Home, User as UserIcon, ShoppingCart, Tag,
  Percent, Star, Shield as ShieldIcon, Lock,
  Unlock, Heart, Share2, Send, Plus, Minus,
  Search, Filter, SortAsc, SortDesc, MoreVertical,
  Edit, Trash2, Archive, ArchiveRestore, RotateCcw,
  Play, Pause, Stop, SkipBack, SkipForward,
  FastForward, Rewind, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, X as XIcon, Check,
  Radio, ToggleLeft, ToggleRight, Eye as EyeIcon,
  EyeOff, Camera, Image, Video, Music, Mic,
  Headphones, Volume2, VolumeX, Bell, BellOff,
  Settings, Menu, Grid, List, Columns, Layout,
  Sidebar, SidebarClose, SidebarOpen, PanelLeft,
  PanelRight, PanelTop, PanelBottom, Split,
  Combine, Grid3x3, Square, Circle, Triangle,
  Hexagon, Octagon, Cross, Star as StarIcon,
  Heart as HeartIcon, ThumbsUp, ThumbsDown,
  Flag, Award, Trophy, Medal, Target as TargetIcon,
  Zap, Cloud, CloudRain, CloudSnow, CloudLightning,
  Sun, Moon, Sunrise, Sunset, Wind, Thermometer,
  Droplets, Umbrella, CloudSun, CloudMoon,
  CloudDrizzle, CloudFog, CloudHail, CloudSleet,
  CloudWind, Hurricane, Tornado, Snowflake,
  ThermometerSun, ThermometerSnowflake, Droplet,
  Thermometer as ThermometerIcon, Compass,
  Map as MapIcon, Navigation as NavigationIcon,
  Globe, Layers, Database, Server, HardDrive,
  Cpu, MemoryStick, Monitor, Smartphone, Tablet,
  Watch, Camera as CameraIcon, Video as VideoIcon,
  Headphones as HeadphonesIcon, Speaker, Mic as MicIcon,
  Gamepad, Keyboard, Mouse, HardDrive as HardDriveIcon,
  Printer as PrinterIcon, Scanner, Router, Wifi,
  Bluetooth, Radio as RadioIcon, Tv, Remote,
  Battery, BatteryCharging, BatteryFull, BatteryLow,
  BatteryMedium, Power, Plug, Zap as ZapIcon,
  Shield as ShieldIcon2, Lock as LockIcon2,
  Unlock as UnlockIcon2, Key, Fingerprint, QrCode,
  Barcode, CreditCard as CreditCardIcon2,
  Wallet, Banknote, Coins, Gem, Crown, Sword,
  Shield as ShieldIcon3, Skull, Ghost,
 Rocket, Satellite, UFO, Meteor,
  Planet, Globe as GlobeIcon2, Moon as MoonIcon2,
  Sun as SunIcon2, Star as StarIcon2, Cloud as CloudIcon2,
  Fire, Water, Leaf, Tree, Flower, Cactus, Apple,
  Banana, Carrot, Pizza, Coffee, Wine, Beer, Cake,
  Cookie, IceCream, Candy, Pizza as PizzaIcon,
  Hamburger, Hotdog, Sandwich, Sushi, Taco, actus
  Ramen, Egg, Milk, Cheese, Fish, Chicken,
  Beef, Egg as EggIcon, Milk as MilkIcon,
  Cheese as CheeseIcon, 
  Fish as FishIcon, Chicken as ChickenIcon,
  Beef as BeefIcon, Apple as AppleIcon,
  Banana as BananaIcon, Carrot as CarrotIcon,
  Leaf as LeafIcon, Tree as TreeIcon, Flower as FlowerIcon,
  Cactus as CactusIcon, Mountain, Tent, Campfire,
  MapPin as MapPinIcon, Navigation2, Compass as CompassIcon,
  Flag as FlagIcon, Anchor, Sailboat, Ship as ShipIcon,
  Car, Bike, Bus, Train, Plane, Helicopter, Rocket as RocketIcon,
  Truck as TruckIcon3, Package as PackageIcon,
  Box as BoxIcon, Pallet, Forklift, Warehouse,
  Factory, Store, ShoppingCart as ShoppingCartIcon,
  Tag as TagIcon, Percent as PercentIcon, Ticket,
  Gift, Package as PackageIcon2, Box as BoxIcon2,
  Cube, Cuboid, Sphere, Cylinder, Cone, Pyramid,
  Diamond, Octahedron, Dodecahedron, Icosahedron,
  Torus, Cylinder as CylinderIcon, Cone as ConeIcon,
  Pyramid as PyramidIcon, Diamond as DiamondIcon,
  Octahedron as OctahedronIcon, Dodecahedron as DodecahedronIcon,
  Icosahedron as IcosahedronIcon, Torus as TorusIcon,
  Cube as CubeIcon, Cuboid as CuboidIcon,
  Sphere as SphereIcon, Cylinder as CylinderIcon2,
  Cone as ConeIcon2, Pyramid as PyramidIcon2,
  Diamond as DiamondIcon2, Octahedron as OctahedronIcon2,
  Dodecahedron as DodecahedronIcon2, Icosahedron as IcosahedronIcon2,
  Torus as TorusIcon2
} from "lucide-react";

function Myorders() {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/track/${orderId}`);
      if (data.success) {
        setMyOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, trackingData: data.tracking, status: data.status }
            : order
        ));
        toast.success("Tracking updated!");
      }
    } catch (error) {
      console.log("Error refreshing tracking:", error);
      toast.error("Failed to update tracking");
    }
  };

  const refreshAllTracking = async () => {
    setRefreshing(true);
    try {
      for (const order of myOrders) {
        if (order.awbCode) {
          await refreshTracking(order._id);
        }
      }
    } catch (error) {
      console.error("Error refreshing all tracking:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const downloadInvoice = async (order) => {
    try {
      setDownloadingInvoice(order._id);
      const { data } = await axios.get(`/api/order/invoice/${order._id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order._id.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const downloadLabel = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/label/${orderId}`);
      if (data.success && data.labelUrl) {
        window.open(data.labelUrl, '_blank');
      }
    } catch (error) {
      toast.error("Failed to download label");
    }
  };

  const trackOnShiprocket = (awbCode) => {
    if (awbCode) {
      window.open(`https://shiprocket.co/tracking/${awbCode}`, '_blank');
    }
  };

  const copyToClipboard = (text, label = '') => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Order Placed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Shipped': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'Out for Delivery': return <Package className="w-5 h-5 text-purple-600" />;
      case 'Processing': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return '';
    }
  };

  const getFilteredOrders = () => {
    let filtered = myOrders;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.awbCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600">No Orders Yet</h2>
            <p className="text-gray-500 mt-2">You haven't placed any orders</p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600 mt-1">Total {myOrders.length} order(s)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Orders</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={refreshAllTracking}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div 
              key={order._id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(order.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-xl font-bold text-gray-800">₹{order.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="text-lg font-medium text-gray-800">{order.items?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment</p>
                        <p className="text-lg font-medium text-gray-800">{order.paymentType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {order.transactionId?.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(order);
                      }}
                      disabled={downloadingInvoice === order._id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      {downloadingInvoice === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Invoice
                    </button>
                    <div className="text-gray-400">
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedOrder === order._id && (
                <div className="p-6 bg-gray-50">
                  {/* Tracking Section */}
                  {order.awbCode ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Truck className="w-6 h-6 text-green-600" />
                          <h3 className="text-lg font-bold text-gray-800">Shipment Tracking</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => refreshTracking(order._id)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition text-sm font-medium flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                          </button>
                          <button
                            onClick={() => trackOnShiprocket(order.awbCode)}
                            className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition text-sm font-medium flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track on Shiprocket
                          </button>
                          <button
                            onClick={() => downloadLabel(order._id)}
                            className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition text-sm font-medium flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Label
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-600 mb-1">AWB Number</p>
                          <div className="flex items-center gap-2">
                            <Hash className="w-5 h-5 text-blue-600" />
                            <p className="text-lg font-bold text-blue-800 font-mono">{order.awbCode}</p>
                            <button
                              onClick={() => copyToClipboard(order.awbCode, 'AWB Code')}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-600 mb-1">Courier</p>
                          <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <p className="text-lg font-bold text-gray-800">{order.courierName || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-600 mb-1">Current Status</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <p className="text-lg font-bold text-gray-800">{order.status}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      {order.trackingData?.history && order.trackingData.history.length > 0 && (
                        <div className="bg-white rounded-lg border p-4">
                          <h4 className="font-bold text-gray-800 mb-3">Tracking History</h4>
                          <div className="space-y-4">
                            {order.trackingData.history.slice(0, 3).map((activity, index) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  {index < order.trackingData.history.length - 1 && (
                                    <div className="w-0.5 h-8 bg-gray-300"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{activity.status}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(activity.date)}</span>
                                    {activity.location && (
                                      <>
                                        <MapPin className="w-3 h-3" />
                                        <span>{activity.location}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {order.trackingData.history.length > 3 && (
                              <button
                                onClick={() => trackOnShiprocket(order.awbCode)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              >
                                View full tracking history
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-800">Tracking not available yet</p>
                          <p className="text-sm text-gray-600">Shipment details will be available once processed</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={item.product?.image?.[0]} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.product?.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Quantity: {item.quantity}</span>
                                <span>•</span>
                                <span>₹{item.product?.offerPrice || 0} each</span>
                              </div>
                            </div>
                          </div>
                          <p className="font-bold text-lg text-gray-800">
                            ₹{(item.product?.offerPrice || 0) * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.address && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h4>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-800">{order.address.firstname} {order.address.lastname}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="w-4 h-4" />
                              <span>{order.address.phone}</span>
                            </div>
                            {order.address.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Mail className="w-4 h-4" />
                                <span>{order.address.email}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-800">{order.address.street}</p>
                            <p className="text-gray-600">
                              {order.address.city}, {order.address.state} - {order.address.pincode}
                            </p>
                            <p className="text-gray-600">{order.address.country || 'India'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Support */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Need help with your order?</p>
                        <p className="text-sm text-gray-600">
                          Contact support: +91 8586845185 • kuntalagrosohna@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Myorders;