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
  IndianRupee
} from 'lucide-react';

const ReturnRefundPolicy = () => {
  const [activeTab, setActiveTab] = useState('eligible');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const productCategories = [
    { id: 'all', label: 'All Products', icon: <Package className="w-4 h-4" /> },
    { id: 'seeds', label: 'Seeds', icon: <Sprout className="w-4 h-4" /> },
    { id: 'fertilizers', label: 'Fertilizers', icon: <Droplets className="w-4 h-4" /> },
    { id: 'pesticides', label: 'Pesticides', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Thermometer className="w-4 h-4" /> }
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
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />
    },
    {
      title: 'Wrong Items Delivered',
      description: 'Received different product than ordered',
      examples: ['Different seed variety', 'Incorrect fertilizer type', 'Wrong equipment model'],
      icon: <Package className="w-5 h-5 text-amber-600" />
    },
    {
      title: 'Expired Products',
      description: 'Products past their expiry date',
      examples: ['Expired pesticides', 'Old seed stock', 'Outdated fertilizers'],
      icon: <Calendar className="w-5 h-5 text-red-600" />
    },
    {
      title: 'Quantity Discrepancy',
      description: 'Short delivery or missing items',
      examples: ['Less quantity than ordered', 'Missing items in package', 'Incomplete sets'],
      icon: <FileText className="w-5 h-5 text-blue-600" />
    }
  ];

  const nonEligibleReturns = [
    {
      title: 'Opened Chemical Products',
      reason: 'Safety and regulatory compliance',
      icon: <XCircle className="w-5 h-5 text-red-500" />
    },
    {
      title: 'Perishable Seeds (Germinated)',
      reason: 'Cannot be resold or reused',
      icon: <Sprout className="w-5 h-5 text-red-500" />
    },
    {
      title: 'Seasonal Clearance Items',
      reason: 'Sold on "as-is" basis',
      icon: <Thermometer className="w-5 h-5 text-red-500" />
    },
    {
      title: 'Custom Ordered Equipment',
      reason: 'Manufactured specifically for you',
      icon: <Package className="w-5 h-5 text-red-500" />
    },
    {
      title: 'Improper Storage Damage',
      reason: 'Not stored as per instructions',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  ];

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return Request',
      description: 'Contact within specified timeframe',
      timeline: 'Within 24-48 hours of delivery',
      icon: <Phone className="w-5 h-5" />
    },
    {
      step: 2,
      title: 'Documentation & Photos',
      description: 'Provide required evidence',
      timeline: 'Same day as request',
      icon: <FileText className="w-5 h-5" />
    },
    {
      step: 3,
      title: 'Pickup Approval',
      description: 'Our team verifies and approves',
      timeline: '1-2 business days',
      icon: <ShieldCheck className="w-5 h-5" />
    },
    {
      step: 4,
      title: 'Product Pickup',
      description: 'Scheduled pickup from your farm',
      timeline: '3-5 business days',
      icon: <Truck className="w-5 h-5" />
    },
    {
      step: 5,
      title: 'Quality Inspection',
      description: 'Verification at our facility',
      timeline: '2-3 business days',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      step: 6,
      title: 'Refund Processing',
      description: 'Amount credited to your account',
      timeline: '5-7 business days',
      icon: <IndianRupee className="w-5 h-5" />
    }
  ];

  const refundMethods = [
    {
      method: 'Original Payment Mode',
      time: '5-7 business days',
      details: 'Credited back to same account/card',
      icon: <RefreshCw className="w-5 h-5 text-green-600" />
    },
    {
      method: 'Bank Transfer',
      time: '3-5 business days',
      details: 'NEFT/RTGS to your bank account',
      icon: <IndianRupee className="w-5 h-5 text-green-600" />
    },
    {
      method: 'Store Credit',
      time: 'Immediate',
      details: 'Kuntal Agro credit for future purchases',
      icon: <ShieldCheck className="w-5 h-5 text-green-600" />
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <RefreshCw className="w-10 h-10 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Kuntal Agro</h1>
              <p className="text-emerald-700 font-semibold">Quality Agriculture Solutions</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Return & Refund Policy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transparent policies for our agricultural community. Know your rights and our commitments.
          </p>
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg max-w-3xl mx-auto">
            <p className="text-emerald-800 font-medium">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Important: Timeframes vary by product type. Read category-specific policies below.
            </p>
          </div>
        </div>

        {/* Product Category Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select Product Category
          </h3>
          <div className="flex flex-wrap gap-3">
            {productCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${selectedCategory === category.id
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700 font-semibold'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
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
            <div className="flex overflow-x-auto">
              {['eligible', 'process', 'timeframes', 'refund', 'special'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-6 py-4 font-medium transition-colors ${activeTab === tab
                      ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab === 'eligible' && 'Eligible Returns'}
                  {tab === 'process' && 'Return Process'}
                  {tab === 'timeframes' && 'Timeframes'}
                  {tab === 'refund' && 'Refund Methods'}
                  {tab === 'special' && 'Special Conditions'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Eligible Returns Tab */}
            {activeTab === 'eligible' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    Eligible for Return
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {eligibleReturns.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                          {item.icon}
                          <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Examples:</p>
                          {item.examples.map((example, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    Not Eligible for Return
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nonEligibleReturns.map((item, index) => (
                      <div key={index} className="border border-red-100 bg-red-50 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          {item.icon}
                          <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                        </div>
                        <p className="text-gray-600">Reason: {item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Return Process Tab */}
            {activeTab === 'process' && (
              <div className="space-y-8">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-emerald-800 mb-2">Important Notes</h4>
                  <ul className="space-y-2 text-emerald-700">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                      Initiate return request within specified timeframe for your product category
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                      Keep all original packaging and documentation ready
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 mt-1 flex-shrink-0" />
                      Do not use the product if you plan to return it
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-emerald-200 hidden md:block"></div>
                  <div className="space-y-8">
                    {returnProcess.map((step) => (
                      <div key={step.step} className="relative flex items-start gap-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-emerald-100 border-4 border-white rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-grow bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            {step.icon}
                            <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                          </div>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
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
                  <h4 className="text-lg font-bold text-amber-800 mb-2">⏱️ Timeframe Guidelines</h4>
                  <p className="text-amber-700">
                    Return windows start from the date of delivery. Different products have different return periods 
                    based on their nature and agricultural requirements.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Product Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Return Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Conditions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
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
                            <div className="text-sm text-gray-600">{item.condition}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.days > 10 ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Flexible
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                Strict
                              </span>
                            )}
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
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        {method.icon}
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
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Refund Timeline</h4>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-gray-700">Return Request Initiated</span>
                        <span className="font-bold text-emerald-700">Day 0</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-gray-700">Pickup & Inspection Completed</span>
                        <span className="font-bold text-emerald-700">Day 3-7</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-gray-700">Refund Initiated</span>
                        <span className="font-bold text-emerald-700">Day 7-10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Amount in Your Account</span>
                        <span className="font-bold text-emerald-700">Day 10-15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Conditions Tab */}
            {activeTab === 'special' && (
              <div className="space-y-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-red-800 mb-2">⚠️ Critical Safety Information</h4>
                  <p className="text-red-700">
                    For chemical products: Never open if you plan to return. Once opened, returns cannot be accepted 
                    due to safety regulations and environmental concerns.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {specialConditions.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5">
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
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Seasonal Considerations</h4>
                  <div className="bg-amber-50 rounded-xl p-6">
                    <ul className="space-y-3 text-amber-800">
                      <li className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>Monsoon Season:</strong> Extended return period for weather-affected deliveries</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sprout className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>Sowing Season:</strong> Early return requests prioritized for seeds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Thermometer className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span><strong>Temperature Sensitive:</strong> Special handling for products affected by heat</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            Need Help with Returns?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-800">Call Us</h4>
              </div>
              <p className="text-gray-600 mb-2">Toll-free support for returns</p>
              <a href="tel:1800180KUNTAL" className="text-xl font-bold text-emerald-700 hover:text-emerald-800">
                1800-180-KUNTAL
              </a>
              <p className="text-sm text-gray-500 mt-1">9 AM - 7 PM, Monday to Saturday</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-800">Email Support</h4>
              </div>
              <p className="text-gray-600 mb-2">For documentation and queries</p>
              <a href="mailto:returns@kuntalagro.com" className="text-lg font-bold text-emerald-700 hover:text-emerald-800 break-all">
                returns@kuntalagro.com
              </a>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-800">Visit Store</h4>
              </div>
              <p className="text-gray-600 mb-2">For in-person returns</p>
              <div className="text-gray-700">
                Kuntal Agro Headquarters<br />
                Agricultural Market Complex<br />
                [Your City], [Your State] - Pincode
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
                A: Only if they are completely unused and the inner seal is intact. Hybrid seeds generally cannot be returned once opened.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: What if the product is damaged during return transit?</h4>
              <p className="text-gray-600">
                A: We insure all return pickups. If damage occurs during our pickup, we'll still process your refund.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Q: Do I need to pay for return shipping?</h4>
              <p className="text-gray-600">
                A: No, for eligible returns within India, we provide free pickup service from your farm/location.
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
            <strong>Kuntal Agro Returns Department</strong> • 
            Last Updated: {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p>
            For agricultural emergency or pesticide-related issues, 
            contact: <span className="font-bold text-emerald-700">1800-XXX-EMERGENCY</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;