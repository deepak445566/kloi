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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-700">Kuntal Agro</span> Agencies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for quality agricultural products and solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Information & Map */}
          <div className="space-y-8">
            {/* Google Map */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
              <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <FaMapMarkerAlt className="text-yellow-300" />
                  Our Location
                </h3>
                <p className="mt-2 text-green-100">Find us easily using Google Maps</p>
              </div>
              <div className="p-2 bg-white">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3514.6354944589857!2d77.06450097390095!3d28.248741201408393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d25006c6ca257%3A0xef37336c16e31e82!2sKuntal%20Agro%20Agencies!5e0!3m2!1sen!2sin!4v1766205587116!5m2!1sen!2sin" 
                  width="100%" 
                  height="400" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Kuntal Agro Agencies Location"
                ></iframe>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="flex items-start gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-green-600 text-xl mt-1" />
                  <div>
                    <p className="font-medium">Shop Address:</p>
                    <p className="text-gray-600">Shop No.1 ward no.19, near Civil Hospital, Sohna, Sohna Rural, Haryana 122103</p>
                    <p className="mt-2 text-sm text-gray-500">Landmark: 63X8+FR Sohna, Haryana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaPhone className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Call Us</h3>
                </div>
                <p className="text-gray-600 mb-4">Available during business hours</p>
                <a 
                  href="tel:+918586845185" 
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-4"
                >
                  +91 85868 45185
                </a>
                <button
                  onClick={handleCall}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaPhone /> Call Now
                </button>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaWhatsapp className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">WhatsApp</h3>
                </div>
                <p className="text-gray-600 mb-4">Quick chat & inquiries</p>
                <p className="text-xl font-bold text-gray-900 mb-4">+91 85868 45185</p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaWhatsapp />  WhatsApp
                </button>
              </div>
            </div>

            {/* Email Card - Added new card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FaEnvelope className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Email Us</h3>
              </div>
              <p className="text-gray-600 mb-4">For detailed inquiries and quotations</p>
              <p className="text-xl font-bold text-gray-900 mb-4">Kuntalagrosohna@gmail.com</p>
              <button
                onClick={handleEmail}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaEnvelope /> Email Now
              </button>
            </div>
          </div>

          {/* Right Column - Store Details */}
          <div className="space-y-8">
            {/* Store Hours Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaClock className="text-orange-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Business Hours</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Monday - Sunday</span>
                  <span className="font-bold text-green-700">8:00 AM - 8:00 PM</span>
                </div>
               
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-semibold">
                    <FaClock className="text-green-600" />
                    <span>Currently: Open · Closes 8 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaStore className="text-purple-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Store Details</h2>
              </div>

              <div className="space-y-6">
                {/* Website */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer" onClick={handleWebsite}>
                  <FaGlobe className="text-blue-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Website</h3>
                    <p className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      kuntalagro.com
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Visit our online portal</p>
                  </div>
                </div>

                {/* Email - Added to store details */}
                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer" onClick={handleEmail}>
                  <FaEnvelope className="text-red-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Email Address</h3>
                    <p className="text-red-600 font-medium hover:text-red-800 transition-colors">
                      Kuntalagrosohna@gmail.com
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Send us your inquiries</p>
                  </div>
                </div>

                {/* Shop Number */}
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <FaStore className="text-green-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Shop Number</h3>
                    <p className="text-gray-800 font-medium">Shop No. 1</p>
                    <p className="text-sm text-gray-600 mt-1">Located in Ward No. 19</p>
                  </div>
                </div>

                {/* Nearby Landmark */}
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                  <FaHospital className="text-orange-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800">Landmark</h3>
                    <p className="text-gray-800 font-medium">Near Civil Hospital, Sohna</p>
                    <p className="text-sm text-gray-600 mt-1">Easy to locate</p>
                  </div>
                </div>

                {/* Address Details */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-3">Complete Address:</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>📍 Shop No.1, Ward No.19</p>
                    <p>📍 Near Civil Hospital</p>
                    <p>📍 Sohna, Sohna Rural</p>
                    <p>📍 Haryana 122103</p>
                    <p className="text-sm text-gray-600 mt-2">Plus Code: 63X8+FR Sohna, Haryana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Our Services</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <p className="font-semibold">Agricultural Products</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <p className="font-semibold">Fertilizers</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <p className="font-semibold">Seeds</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <p className="font-semibold">Pesticides</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-lg">We're here to serve your agricultural needs. Feel free to reach out through any of the above channels!</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;