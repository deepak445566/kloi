import React from 'react';
import { FaPhone, FaMapMarkerAlt, FaGlobe, FaClock, FaStore, FaHospital, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Contact = () => {
  const handleCall = () => {
    window.location.href = 'tel:+918586845185';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/918586845185', '_blank');
  };

  const handleWebsite = () => {
    window.open('https://kuntalagro.com', '_blank');
  };

  const handleEmail = () => {
    window.location.href = 'mailto:Kuntalagrosohna@gmail.com';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            <span className="text-green-700">Kuntal Agro</span> Agencies
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for quality agricultural products and solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column - Contact Information & Map */}
          <div className="space-y-6 sm:space-y-8">
            {/* Google Map */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-green-100">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                  <FaMapMarkerAlt className="text-yellow-300 text-lg sm:text-xl" />
                  Our Location
                </h3>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-green-100">Find us easily using Google Maps</p>
              </div>
              <div className="p-1 sm:p-2 bg-white">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3514.6354944589857!2d77.06450097390095!3d28.248741201408393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d25006c6ca257%3A0xef37336c16e31e82!2sKuntal%20Agro%20Agencies!5e0!3m2!1sen!2sin!4v1766205587116!5m2!1sen!2sin" 
                  width="100%" 
                  height="300" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Kuntal Agro Agencies Location"
                ></iframe>
              </div>
              <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-green-600 text-base sm:text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Shop Address:</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Shop No.1 ward no.19, near Civil Hospital, Sohna, Sohna Rural, Haryana 122103</p>
                    <p className="mt-1 sm:mt-2 text-xs text-gray-500">Landmark: 63X8+FR Sohna, Haryana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards - Grid responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Phone Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 border-t-4 border-blue-500 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                    <FaPhone className="text-blue-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Call Us</h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Available during business hours</p>
                <a 
                  href="tel:+918586845185" 
                  className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-3 sm:mb-4"
                >
                  +91 85868 45185
                </a>
                <button
                  onClick={handleCall}
                  className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaPhone className="text-sm sm:text-base" /> Call Now
                </button>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 border-t-4 border-green-500 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                    <FaWhatsapp className="text-green-600 text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">WhatsApp</h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Quick chat & inquiries</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">+91 85868 45185</p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaWhatsapp className="text-sm sm:text-base" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 border-t-4 border-red-500 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <FaEnvelope className="text-red-600 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Email Us</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">For detailed inquiries and quotations</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">Kuntalagrosohna@gmail.com</p>
              <button
                onClick={handleEmail}
                className="w-full py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaEnvelope className="text-sm sm:text-base" /> Email Now
              </button>
            </div>
          </div>

          {/* Right Column - Store Details */}
          <div className="space-y-6 sm:space-y-8">
            {/* Store Hours Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 lg:p-8 border-t-4 border-orange-500">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                  <FaClock className="text-orange-600 text-xl sm:text-2xl" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Business Hours</h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Monday - Sunday</span>
                  <span className="font-bold text-green-700 text-base sm:text-lg">8:00 AM - 8:00 PM</span>
                </div>
               
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-semibold text-sm sm:text-base">
                    <FaClock className="text-green-600" />
                    <span>Currently: Open · Closes 8 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Details Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 lg:p-8 border-t-4 border-purple-500">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <FaStore className="text-purple-600 text-xl sm:text-2xl" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Store Details</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Website */}
                <div 
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-colors cursor-pointer" 
                  onClick={handleWebsite}
                >
                  <FaGlobe className="text-blue-600 text-xl sm:text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Website</h3>
                    <p className="text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm sm:text-base break-words">
                      kuntalagro.com
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Visit our online portal</p>
                  </div>
                </div>

                {/* Email */}
                <div 
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors cursor-pointer" 
                  onClick={handleEmail}
                >
                  <FaEnvelope className="text-red-600 text-xl sm:text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Email Address</h3>
                    <p className="text-red-600 font-medium hover:text-red-800 transition-colors text-sm sm:text-base break-words">
                      Kuntalagrosohna@gmail.com
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Send us your inquiries</p>
                  </div>
                </div>

                {/* Shop Number */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                  <FaStore className="text-green-600 text-xl sm:text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Shop Number</h3>
                    <p className="text-gray-800 font-medium text-sm sm:text-base">Shop No. 1</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Located in Ward No. 19</p>
                  </div>
                </div>

                {/* Nearby Landmark */}
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                  <FaHospital className="text-orange-600 text-xl sm:text-2xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Landmark</h3>
                    <p className="text-gray-800 font-medium text-sm sm:text-base">Near Civil Hospital, Sohna</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Easy to locate</p>
                  </div>
                </div>

                {/* Address Details */}
                <div className="p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Complete Address:</h4>
                  <div className="space-y-1 sm:space-y-2 text-gray-700 text-xs sm:text-sm">
                    <p>📍 Shop No.1, Ward No.19</p>
                    <p>📍 Near Civil Hospital</p>
                    <p>📍 Sohna, Sohna Rural</p>
                    <p>📍 Haryana 122103</p>
                    <p className="text-xs text-gray-600 mt-1 sm:mt-2">Plus Code: 63X8+FR Sohna, Haryana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 lg:p-8 text-white">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Our Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-green-500/20 p-3 sm:p-4 rounded-lg">
                  <p className="font-semibold text-sm sm:text-base">Agricultural Products</p>
                </div>
                <div className="bg-green-500/20 p-3 sm:p-4 rounded-lg">
                  <p className="font-semibold text-sm sm:text-base">Fertilizers</p>
                </div>
                <div className="bg-green-500/20 p-3 sm:p-4 rounded-lg">
                  <p className="font-semibold text-sm sm:text-base">Seeds</p>
                </div>
                <div className="bg-green-500/20 p-3 sm:p-4 rounded-lg">
                  <p className="font-semibold text-sm sm:text-base">Pesticides</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-center text-gray-600 px-2">
          <p className="text-sm sm:text-base lg:text-lg">
            We're here to serve your agricultural needs. Feel free to reach out through any of the above channels!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;