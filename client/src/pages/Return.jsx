// ReturnRefundPolicy.jsx
import React, { useState } from 'react';
import { 
  RefreshCw, 
  Package, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar,
  Sprout,
  Droplets,
  Thermometer,
  FileText,
  Phone,
  Mail,
  MapPin,
  Map,
  IndianRupee,
  ChevronRight,
  Home,
  Users,
  Leaf,
  MessageCircle,
  Globe,
  Store
} from 'lucide-react';

const ReturnRefundPolicy = () => {
  const [activeTab, setActiveTab] = useState('eligible');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const isOpen = currentHour >= 8 && currentHour < 20;

  // Product categories specific to agro business
  const productCategories = [
    { id: 'all', label: 'All Products', icon: <Package className="w-5 h-5" /> },
    { id: 'seeds', label: 'Seeds & Saplings', icon: <Sprout className="w-5 h-5" /> },
    { id: 'fertilizers', label: 'Fertilizers', icon: <Droplets className="w-5 h-5" /> },
    { id: 'pesticides', label: 'Pesticides', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'equipment', label: 'Equipment', icon: <Thermometer className="w-5 h-5" /> },
    { id: 'irrigation', label: 'Irrigation', icon: <Droplets className="w-5 h-5" /> }
  ];

  const returnTimeframes = [
    { product: 'Seeds (Non-Hybrid)', days: 15, condition: 'Unopened with original packaging' },
    { product: 'Seeds (Hybrid/F1)', days: 7, condition: 'Unopened, before sowing season' },
    { product: 'Chemical Fertilizers', days: 10, condition: 'Seal intact, within expiry' },
    { product: 'Organic Fertilizers', days: 15, condition: 'Unopened, proper storage' },
    { product: 'Pesticides/Herbicides', days: 5, condition: 'Seal intact, not damaged' },
    { product: 'Agricultural Equipment', days: 30, condition: 'Unused, original packaging' },
    { product: 'Irrigation Supplies', days: 15, condition: 'Unused, no installation' },
    { product: 'Protective Gear', days: 10, condition: 'Unused, tags attached' }
  ];

  const eligibleReturns = [
    {
      title: 'Defective Products',
      description: 'Manufacturing defects or damage during transit',
      examples: ['Broken equipment parts', 'Leaking pesticide containers', 'Damaged seed packets'],
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />
    },
    {
      title: 'Wrong Items Delivered',
      description: 'Received different product than ordered',
      examples: ['Different seed variety', 'Incorrect fertilizer type', 'Wrong equipment model'],
      icon: <Package className="w-6 h-6 text-amber-600" />
    },
    {
      title: 'Expired Products',
      description: 'Products past their expiry date',
      examples: ['Expired pesticides', 'Old seed stock', 'Outdated fertilizers'],
      icon: <Calendar className="w-6 h-6 text-red-600" />
    },
    {
      title: 'Quantity Discrepancy',
      description: 'Short delivery or missing items',
      examples: ['Less quantity than ordered', 'Missing items in package', 'Incomplete sets'],
      icon: <FileText className="w-6 h-6 text-blue-600" />
    }
  ];

  const nonEligibleReturns = [
    {
      title: 'Opened Chemical Products',
      reason: 'Safety and regulatory compliance',
      icon: <XCircle className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Perishable Seeds (Germinated)',
      reason: 'Cannot be resold or reused',
      icon: <Sprout className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Seasonal Clearance Items',
      reason: 'Sold on "as-is" basis',
      icon: <Thermometer className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Custom Ordered Equipment',
      reason: 'Manufactured specifically for you',
      icon: <Package className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Improper Storage Damage',
      reason: 'Not stored as per instructions',
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />
    }
  ];

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return Request',
      description: 'Contact our Sohna store support team',
      timeline: 'Within 24-48 hours of delivery',
      icon: <Phone className="w-6 h-6" />
    },
    {
      step: 2,
      title: 'Documentation & Photos',
      description: 'Provide required evidence and photos',
      timeline: 'Same day as request',
      icon: <FileText className="w-6 h-6" />
    },
    {
      step: 3,
      title: 'Pickup/Visit Approval',
      description: 'Our team verifies and approves',
      timeline: '1-2 business days',
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      step: 4,
      title: 'Return to Store',
      description: 'Visit our Sohna location or schedule pickup',
      timeline: '3-5 business days',
      icon: <Truck className="w-6 h-6" />
    },
    {
      step: 5,
      title: 'Quality Inspection',
      description: 'Verification at our store',
      timeline: '1-2 business days',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: 6,
      title: 'Refund Processing',
      description: 'Amount credited to your account',
      timeline: '3-5 business days',
      icon: <IndianRupee className="w-6 h-6" />
    }
  ];

  const refundMethods = [
    {
      method: 'Cash Refund',
      time: 'Immediate (in-store)',
      details: 'For returns made directly at our Sohna store',
      icon: <IndianRupee className="w-6 h-6 text-green-600" />
    },
    {
      method: 'Bank Transfer',
      time: '3-5 business days',
      details: 'NEFT/RTGS to your bank account',
      icon: <RefreshCw className="w-6 h-6 text-green-600" />
    },
    {
      method: 'Store Credit',
      time: 'Immediate',
      details: 'Credit for future purchases at Kuntal Agro',
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />
    }
  ];

  const specialConditions = [
    {
      category: 'Pesticides & Chemicals',
      conditions: [
        'Safety seals must be intact',
        'Original packaging required',
        'No mixing or transferring',
        'Report within 24 hours for leaks'
      ]
    },
    {
      category: 'Seeds & Planting Material',
      conditions: [
        'Return before sowing season starts',
        'Proper storage evidence required',
        'Germination test reports for complaints',
        'Hybrid seeds - strict 7-day policy'
      ]
    },
    {
      category: 'Agricultural Equipment',
      conditions: [
        'All original accessories included',
        'No scratches or usage marks',
        'Original manuals and warranty cards',
        'Complete packaging materials'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-amber-50 py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Updated Contact Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="lg:w-2/3">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kuntal Agro Agencies</h1>
                  <p className="text-emerald-700 font-semibold text-lg">Your trusted partner for quality agricultural products and solutions</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Sohna Store Location</p>
                    <p className="text-gray-600 text-sm">
                      Shop No.1, Ward No.19, Near Civil Hospital<br />
                      Sohna, Sohna Rural, Haryana 122103
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Business Hours</p>
                    <p className="text-gray-600 text-sm">
                      Monday - Sunday: 8:00 AM - 8:00 PM<br />
                      <span className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        Currently: {isOpen ? 'Open · Closes 8 PM' : 'Closed · Opens 8 AM'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Contact Card */}
            <div className="lg:w-1/3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Contact</h3>
              <div className="space-y-3">
                <a href="tel:+918586845185" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow transition-shadow">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Call Us</p>
                    <p className="text-gray-700 font-bold">+91 85868 45185</p>
                  </div>
                </a>
                <a href="https://wa.me/918586845185" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow transition-shadow">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">WhatsApp</p>
                    <p className="text-gray-700 font-bold">+91 85868 45185</p>
                  </div>
                </a>
                <a href="mailto:Kuntalagrosohna@gmail.com" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow transition-shadow">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Us</p>
                    <p className="text-gray-700 text-sm">Kuntalagrosohna@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Return & Refund Policy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Transparent and fair return policies for our farming community. Visit our Sohna store for in-person returns.
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 rounded-r-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Important Notice for Local Customers</h3>
              <p className="text-amber-800">
                For returns within Sohna area, you can visit our store directly during business hours. 
                Chemical products have strict return windows - please read category-specific policies below.
              </p>
            </div>
          </div>
        </div>

        {/* Product Category Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select Product Category for Return Details
          </h3>
          <div className="flex flex-wrap gap-3">
            {productCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${selectedCategory === category.id
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700 font-semibold shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="border-b">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'eligible', label: 'Eligible Returns', icon: <CheckCircle className="w-4 h-4" /> },
                { id: 'process', label: 'Return Process', icon: <RefreshCw className="w-4 h-4" /> },
                { id: 'timeframes', label: 'Timeframes', icon: <Clock className="w-4 h-4" /> },
                { id: 'refund', label: 'Refund Methods', icon: <IndianRupee className="w-4 h-4" /> },
                { id: 'special', label: 'Special Conditions', icon: <ShieldCheck className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 flex-shrink-0 px-6 py-4 font-medium transition-colors relative ${activeTab === tab.id
                      ? 'text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Eligible Returns Tab */}
            {activeTab === 'eligible' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Eligible for Return</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {eligibleReturns.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                            <p className="text-gray-600 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
                          <div className="space-y-2">
                            {item.examples.map((example, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <ChevronRight className="w-4 h-4 text-emerald-500" />
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Not Eligible for Return</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nonEligibleReturns.map((item, index) => (
                      <div key={index} className="border border-red-100 bg-red-50 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg">
                            {item.icon}
                          </div>
                          <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                        </div>
                        <p className="text-gray-600 text-sm">Reason: {item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Return Process Tab */}
            {activeTab === 'process' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Store className="w-6 h-6 text-emerald-600 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-emerald-800 mb-2">🏪 For Sohna Area Customers</h4>
                      <p className="text-emerald-700">
                        You can visit our store directly at Shop No.1, Ward No.19, Near Civil Hospital, Sohna 
                        during business hours (8 AM - 8 PM) for faster return processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-green-200"></div>
                  <div className="space-y-8">
                    {returnProcess.map((step) => (
                      <div key={step.step} className="relative flex items-start gap-6">
                        <div className="relative flex-shrink-0 w-16 h-16">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full opacity-10"></div>
                          <div className="relative w-16 h-16 bg-white border-4 border-white rounded-full flex items-center justify-center shadow-md">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                              {step.step}
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {step.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                          </div>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                            <Clock className="w-4 h-4" />
                            Timeline: {step.timeline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timeframes Tab */}
            {activeTab === 'timeframes' && (
              <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-amber-800 mb-2">⏱️ Return Timeframe Guidelines</h4>
                  <p className="text-amber-700">
                    Return windows start from the date of purchase/delivery. Different products have different return periods 
                    based on their nature and agricultural requirements.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          Product Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          Return Period
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          Conditions
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">
                          Store Return
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {returnTimeframes.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-emerald-600" />
                              <span className="font-medium text-gray-900">{item.product}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-gray-900">{item.days} days</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs">{item.condition}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${item.days > 10 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                              {item.days > 10 ? 'Flexible' : 'In-store Only'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Refund Methods Tab */}
            {activeTab === 'refund' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {refundMethods.map((method, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                          {method.icon}
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">{method.method}</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Processing Time:</span>
                          <span className="font-bold text-emerald-700">{method.time}</span>
                        </div>
                        <div className="text-sm text-gray-500">{method.details}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Refund Timeline Overview</h4>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Return Request/Visit to Store', day: 'Day 0', color: 'text-emerald-600' },
                        { label: 'Quality Inspection Completed', day: 'Day 0-1 (in-store)', color: 'text-emerald-700' },
                        { label: 'Refund Processed', day: 'Day 1-3', color: 'text-emerald-800' },
                        { label: 'Amount Received', day: 'Day 1-5', color: 'text-green-900' }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                          <span className="text-gray-700">{item.label}</span>
                          <span className={`font-bold ${item.color}`}>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Conditions Tab */}
            {activeTab === 'special' && (
              <div className="space-y-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-red-800 mb-2">⚠️ Critical Safety Information</h4>
                      <p className="text-red-700">
                        For chemical products: Never open if you plan to return. Once opened, returns cannot be accepted 
                        due to safety regulations and environmental concerns. Visit our Sohna store immediately for leak issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {specialConditions.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b">
                        {category.category}
                      </h4>
                      <ul className="space-y-3">
                        {category.conditions.map((condition, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Local Service Information</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                    <ul className="space-y-3 text-blue-800">
                      <li className="flex items-start gap-2">
                        <Truck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>Local Delivery:</strong> Free delivery within Sohna area for orders above ₹2000</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Store className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>In-store Returns:</strong> Faster processing at our Sohna location</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sprout className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>Seasonal Advice:</strong> Free agricultural consultation at store</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Updated Contact & Support Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            Need Help with Returns? Contact Us
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-800">Visit Our Store</h4>
              </div>
              <div className="text-gray-600 mb-3">
                <p className="font-medium">Shop No.1, Ward No.19</p>
                <p className="text-sm">Near Civil Hospital, Sohna</p>
                <p className="text-sm">Sohna Rural, Haryana 122103</p>
              </div>
              <a 
                href="https://maps.google.com/?q=Shop+No.1+ward+no.19,+near+Civil+Hospital,+Sohna,+Sohna+Rural,+Haryana+122103"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800"
              >
                <Map className="w-4 h-4" />
                Open in Google Maps
              </a>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-6 h-6 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-800">Call Us</h4>
              </div>
              <p className="text-gray-600 mb-2">Available during business hours</p>
              <a href="tel:+918586845185" className="text-xl font-bold text-emerald-700 hover:text-emerald-800 block mb-2">
                +91 85868 45185
              </a>
              <div className="text-sm text-gray-500">
                <Clock className="inline w-3 h-3 mr-1" />
                8:00 AM - 8:00 PM, Daily
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-bold text-gray-800">WhatsApp</h4>
              </div>
              <p className="text-gray-600 mb-2">Quick chat & inquiries</p>
              <a href="https://wa.me/918586845185" className="text-lg font-bold text-green-700 hover:text-green-800 block mb-3">
                +91 85868 45185
              </a>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                Fast Response
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-bold text-gray-800">Email Us</h4>
              </div>
              <p className="text-gray-600 mb-2">For detailed inquiries</p>
              <a href="mailto:Kuntalagrosohna@gmail.com" className="text-lg font-bold text-blue-700 hover:text-blue-800 block mb-2 break-all">
                Kuntalagrosohna@gmail.com
              </a>
              <div className="flex items-center gap-2 mt-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href="https://kuntalagro.com" className="text-sm text-gray-600 hover:text-emerald-700">
                  kuntalagro.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: Can I return opened seed packets?</h4>
              <p className="text-gray-600">
                A: Only if they are completely unused and the inner seal is intact. Hybrid seeds generally cannot be returned once opened. Visit our Sohna store for inspection.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: What are your store timings for returns?</h4>
              <p className="text-gray-600">
                A: Our Sohna store is open daily from 8:00 AM to 8:00 PM. You can visit any day for returns and exchanges.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: Do I need the original bill for returns?</h4>
              <p className="text-gray-600">
                A: Yes, please bring the original purchase bill and complete packaging for all returns. This helps us process your return faster.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: Is there free delivery in Sohna area?</h4>
              <p className="text-gray-600">
                A: Yes, we provide free delivery within Sohna area for orders above ₹2000. Contact us for delivery details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-emerald-300"></div>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div className="w-8 h-0.5 bg-emerald-300"></div>
          </div>
          <p className="mb-2">
            <strong>Kuntal Agro Agencies - Sohna Store</strong> • 
            Last Updated: {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p>
            For agricultural emergency or pesticide-related issues, 
            contact: <span className="font-bold text-emerald-700">+91 85868 45185</span>
          </p>
          <p className="mt-2 text-xs">
            Shop No.1, Ward No.19, Near Civil Hospital, Sohna, Haryana 122103
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;