import React from 'react';
import { FaTruck, FaShieldAlt, FaMapMarkerAlt, FaClock, FaPhone, FaLeaf, FaRecycle } from 'react-icons/fa';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Shipping Policy
            </span>
            <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Kuntal Agro Agencies <span className="text-green-700">Shipping Policy</span>
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6"></div>
          
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Delivering quality agricultural products to your doorstep across Sohna & Gurugram
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center mb-4">
                  <FaTruck className="text-3xl mr-3" />
                  <h2 className="text-2xl font-bold">Fast & Reliable Delivery</h2>
                </div>
                <p className="text-green-100">
                  Serving farmers in Sohna, Gurugram and surrounding areas with prompt delivery services
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">Same Day</div>
                  <div className="text-sm text-green-100">Delivery Available</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Service Areas */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FaMapMarkerAlt className="text-green-600 text-xl mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Service Areas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h4 className="font-bold text-gray-900 text-lg mb-3">Primary Service Areas</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Sohna (All Areas)
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Gurugram City
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Badshahpur
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Sohna Road
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 text-lg mb-3">Extended Service Areas</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Farrukhnagar
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Pataudi
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Manesar
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Bilaspur
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FaClock className="text-green-600 text-xl mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Delivery Timeline</h3>
              </div>
              
              <div className="relative">
                {/* Timeline */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-600"></div>
                
                <div className="space-y-8">
                  {/* Same Day Delivery */}
                  <div className="relative">
                    <div className="md:flex items-center">
                      <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-2">
                          Same Day Delivery
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Orders before 12 PM</h4>
                        <p className="text-gray-600 mt-2">
                          Orders placed before 12:00 PM are delivered on the same day
                        </p>
                      </div>
                      
                      {/* Timeline Dot */}
                      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 bg-green-600 rounded-full border-4 border-white shadow-lg"></div>
                      </div>
                      
                      <div className="md:w-1/2 md:pl-12">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-green-600 font-bold">12</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Cut-off Time</p>
                              <p className="text-sm text-gray-600">Orders before 12:00 PM</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center mb-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Delivery between 4 PM - 8 PM
                            </p>
                            <p className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Available for Sohna & nearby areas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Day Delivery */}
                  <div className="relative">
                    <div className="md:flex items-center">
                      <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0 order-2 md:order-1">
                        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-2">
                          Next Day Delivery
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Orders after 12 PM</h4>
                        <p className="text-gray-600 mt-2">
                          Orders placed after 12:00 PM are delivered the next day
                        </p>
                      </div>
                      
                      {/* Timeline Dot */}
                      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                      </div>
                      
                      <div className="md:w-1/2 md:pl-12 order-1 md:order-2">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold">24</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">24 Hours Delivery</p>
                              <p className="text-sm text-gray-600">Next day delivery guaranteed</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center mb-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Delivery between 10 AM - 6 PM
                            </p>
                            <p className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Available for all service areas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Charges */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FaShieldAlt className="text-green-600 text-xl mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Shipping Charges</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-700">₹0</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Free Shipping</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    For orders above ₹2000 within Sohna
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    No hidden charges
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-100 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-yellow-700">₹50</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Standard Shipping</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    For orders below ₹2000 within Sohna
                  </p>
                  <div className="text-xs text-yellow-600 font-medium">
                    Fixed shipping rate
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-700">₹100+</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Extended Areas</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    For delivery outside Sohna
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Charges vary by location
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaLeaf className="text-green-600 mr-2" />
                Important Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Delivery Timings</h4>
                    <p className="text-gray-600 text-sm">
                      Our delivery hours are 9:00 AM to 8:00 PM, Monday to Saturday. We are closed on Sundays and public holidays.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Order Tracking</h4>
                    <p className="text-gray-600 text-sm">
                      You will receive an SMS with delivery updates and the delivery executive's contact number.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Contactless Delivery</h4>
                    <p className="text-gray-600 text-sm">
                      We offer contactless delivery options. You can pay online or choose COD (Cash on Delivery).
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Rural Areas</h4>
                    <p className="text-gray-600 text-sm">
                      For rural farming areas, delivery may take additional 1-2 days. We'll inform you about the exact timeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact for Delivery Queries */}
            <div className="mt-12 text-center">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaPhone className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Help with Delivery?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Contact our delivery team for any queries about shipping, delivery timelines, or service areas.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="tel:+919911577652"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <FaPhone className="mr-2" />
                    Call: +91 9911577652
                  </a>
                  <a
                    href="https://wa.me/919911577652"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    WhatsApp Inquiry
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Last Updated:</span> January 2025
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Kuntal Agro Agencies reserves the right to modify shipping policy
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRecycle className="text-green-600" />
                  <span className="text-sm text-gray-700 font-medium">Sustainable Delivery Practices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;