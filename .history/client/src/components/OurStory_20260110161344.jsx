import React, { useState, useEffect } from 'react';
import { 
  FaLeaf, 
  FaTractor, 
  FaSeedling, 
  FaSprayCan, 
  FaAward,
  FaUsers,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaStar,
  FaHandsHelping,
  FaRecycle,
  FaChevronRight
} from 'react-icons/fa';
import { GiWheat, GiFarmer, GiPlantWatering } from 'react-icons/gi';
import { motion } from 'framer-motion';

const OurStory = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data Arrays
  const achievements = [
    { icon: <FaCalendarAlt />, value: '2018', label: 'Established', subLabel: 'Year of Foundation' },
    { icon: <FaUsers />, value: '5000+', label: 'Farmers', subLabel: 'Happy Customers' },
    { icon: <FaLeaf />, value: '200+', label: 'Products', subLabel: 'Agricultural Range' },
    { icon: <FaStar />, value: '98%', label: 'Satisfaction', subLabel: 'Customer Rating' },
  ];

  const coreValues = [
    {
      icon: <FaCheckCircle />,
      title: 'Quality Assurance',
      description: 'Only certified and genuine agricultural products',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <GiFarmer />,
      title: 'Farmer Centric',
      description: 'Solutions tailored to local farming needs',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: <FaRecycle />,
      title: 'Sustainable Growth',
      description: 'Promoting eco-friendly farming practices',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Trust & Reliability',
      description: 'Building lasting relationships with farmers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const products = [
    { name: 'Fertilizers', icon: <GiWheat />, count: '50+ Types' },
    { name: 'Pesticides', icon: <FaSprayCan />, count: '40+ Variants' },
    { name: 'Seeds', icon: <FaSeedling />, count: '30+ Varieties' },
    { name: 'Equipment', icon: <FaTractor />, count: '20+ Machines' },
    { name: 'Irrigation', icon: <GiPlantWatering />, count: '15+ Systems' },
    { name: 'Farm Tools', icon: '🛠️', count: '60+ Tools' },
  ];

  const timeline = [
    { year: '2018', title: 'Foundation', description: 'Kuntal Agro Agencies established in Sohna' },
    { year: '2019', title: 'Expansion', description: 'Added 50+ new agricultural products' },
    { year: '2020', title: 'Recognition', description: 'Udyam MSME Registration' },
    { year: '2021', title: 'Growth', description: 'Served 1000+ farmers in Gurugram region' },
    { year: '2022', title: 'Innovation', description: 'Introduced modern farming solutions' },
    { year: '2023', title: 'Milestone', description: '5000+ happy farmers served' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 text-white py-8 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-4 right-4 sm:top-10 sm:right-10 w-32 h-32 sm:w-64 sm:h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20"></div>
        <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 w-36 h-36 sm:w-72 sm:h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                <FaSeedling className="text-3xl sm:text-4xl text-yellow-300" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              Our <span className="text-yellow-300">Agricultural</span> Journey
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-green-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Empowering Farmers with Quality & Trust Since 2018
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base">
                <FaMapMarkerAlt className="mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Sohna, Gurugram</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base">
                <FaAward className="mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Udyam Certified</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base">
                <FaHandsHelping className="mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Trusted Partner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            {/* Left - Brand Story */}
            <div>
              <div className="inline-block mb-3 sm:mb-4">
                <span className="bg-green-100 text-green-800 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                  OUR STORY
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                From a Vision to a <span className="text-green-600">Trusted Name</span> in Agriculture
              </h2>
              
              <div className="space-y-3 sm:space-y-4 text-gray-600">
                <p className="text-base sm:text-lg">
                  <span className="font-bold text-green-800">Kuntal Agro Agencies</span>, established in October 2018 in Sohna, Gurugram, began with a simple yet powerful vision: to provide farmers with access to genuine, high-quality agricultural inputs.
                </p>
                
                <p className="text-base sm:text-lg">
                  Operating under the trusted identity of <span className="font-bold text-green-800">"Kuntal Agro Expert"</span>, we have grown from a small dealership to a comprehensive agricultural solutions provider, serving thousands of farmers across the region.
                </p>
                
                <p className="text-base sm:text-lg">
                  Our journey is built on the foundation of trust, quality, and farmer-centric approach, making us the preferred choice for agricultural needs in Sohna and surrounding areas.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {achievements.slice(0, 2).map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-green-700">{item.value}</div>
                    <div className="text-sm sm:text-base text-gray-900 font-semibold">{item.label}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{item.subLabel}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Brand Visual */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-lg sm:shadow-2xl">
                <div className="text-center">
                  <div className="relative inline-block mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-lg opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-xl sm:shadow-2xl">
                      <FaSeedling className="text-white text-3xl sm:text-5xl" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Kuntal Agro Expert</h3>
                  <p className="text-green-700 font-semibold mb-4 text-sm sm:text-base">Your Farming Success Partner</p>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-6">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {products.slice(0, 3).map((product, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xl sm:text-2xl mb-1 sm:mb-2 ml-5">{product.icon}</div>
                          <div className="text-xs sm:text-sm font-medium text-gray-800 truncate px-1">{product.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto active:scale-95">
                    <span className="flex items-center justify-center">
                      <FaWhatsapp className="mr-2 flex-shrink-0" />
                      <span className="truncate">Connect on WhatsApp</span>
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-yellow-400 rounded-full opacity-10 blur-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-green-400 rounded-full opacity-10 blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-green-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our <span className="text-green-600">Achievements</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">Milestones in our journey of serving farmers</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {achievements.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 active:scale-95"
              >
                <div className="text-green-600 text-2xl sm:text-3xl mb-2 sm:mb-4">{item.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{item.value}</div>
                <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">{item.label}</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">{item.subLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="bg-green-100 text-green-800 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                OUR VALUES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              The <span className="text-green-600">Principles</span> That Guide Us
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {coreValues.map((value, index) => (
              <div 
                key={index}
                className={`${value.bgColor} p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-95`}
              >
                <div className={`${value.color} text-2xl sm:text-3xl mb-3 sm:mb-4`}>{value.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{value.title}</h3>
                <p className="text-gray-600 text-sm sm:text-md line-clamp-3">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-green-50 to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Complete <span className="text-green-600">Agricultural</span> Range
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">Everything a farmer needs for successful cultivation</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {products.map((product, index) => (
              <div 
                key={index}
                className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 text-center group cursor-pointer active:scale-95"
                role="button"
                tabIndex={0}
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 text-green-600 group-hover:scale-110 transition-transform">
                  {product.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate px-1">{product.name}</h3>
                <p className="text-xs sm:text-sm text-green-700 font-medium truncate">{product.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Swipe Indicator */}
      <div className="lg:hidden py-4 px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-green-50 rounded-full px-4 py-2">
            <span className="text-green-700 text-sm font-medium mr-2">Scroll horizontally to see more</span>
            <FaChevronRight className="text-green-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Grow Your Farm?
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
            Join thousands of successful farmers who trust Kuntal Agro Expert
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-base sm:text-lg">
              <span className="flex items-center justify-center">
                <FaPhoneAlt className="mr-2" />
                Call Now
              </span>
            </button>
            <button className="bg-white text-green-700 font-semibold px-6 sm:px-8 py-3 rounded-full border-2 border-green-600 hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-base sm:text-lg">
              <span className="flex items-center justify-center">
                <FaWhatsapp className="mr-2 text-green-600" />
                WhatsApp
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Decoration */}
      <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
    </div>
  );
};

export default OurStory;