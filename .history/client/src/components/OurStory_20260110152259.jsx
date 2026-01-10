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
  FaRecycle
} from 'react-icons/fa';
import { GiWheat, GiFarmer, GiPlantWatering } from 'react-icons/gi';

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
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 text-white py-8 md:py-10 rounded-4xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <FaSeedling className="text-4xl text-yellow-300" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Our <span className="text-yellow-300">Agricultural</span> Journey
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Empowering Farmers with Quality & Trust Since 2018
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaMapMarkerAlt className="mr-2" />
                <span>Sohna, Gurugram</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaAward className="mr-2" />
                <span>Udyam Certified</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaHandsHelping className="mr-2" />
                <span>Trusted Partner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left - Brand Story */}
            <div>
              <div className="inline-block mb-4">
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
                  OUR STORY
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                From a Vision to a <span className="text-green-600">Trusted Name</span> in Agriculture
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p className="text-lg">
                  <span className="font-bold text-green-800">Kuntal Agro Agencies</span>, established in October 2018 in Sohna, Gurugram, began with a simple yet powerful vision: to provide farmers with access to genuine, high-quality agricultural inputs.
                </p>
                
                <p className="text-lg">
                  Operating under the trusted identity of <span className="font-bold text-green-800">"Kuntal Agro Expert"</span>, we have grown from a small dealership to a comprehensive agricultural solutions provider, serving thousands of farmers across the region.
                </p>
                
                <p className="text-lg">
                  Our journey is built on the foundation of trust, quality, and farmer-centric approach, making us the preferred choice for agricultural needs in Sohna and surrounding areas.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {achievements.slice(0, 2).map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{item.value}</div>
                    <div className="text-gray-900 font-semibold">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.subLabel}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Brand Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 md:p-12 shadow-2xl">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-lg opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl">
                      <FaSeedling className="text-white text-5xl" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Kuntal Agro Expert</h3>
                  <p className="text-green-700 font-semibold mb-4">Your Farming Success Partner</p>
                  
                  <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      {products.slice(0, 3).map((product, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl mb-2 ml-2 lg:ml-7">{product.icon}</div>
                          <div className="text-sm font-medium text-gray-800">{product.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <span className="flex items-center">
                      <FaWhatsapp className="mr-2" />
                      Connect on WhatsApp
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-10 blur-lg"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-400 rounded-full opacity-10 blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-10 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-green-600">Achievements</span>
            </h2>
            <p className="text-gray-600 text-lg">Milestones in our journey of serving farmers</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-green-600 text-3xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{item.value}</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{item.label}</div>
                <div className="text-sm text-gray-500">{item.subLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
                OUR VALUES
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-green-600">Principles</span> That Guide Us
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={index}
                className={`${value.bgColor} p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`${value.color} text-3xl mb-4`}>{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete <span className="text-green-600">Agricultural</span> Range
            </h2>
            <p className="text-gray-600 text-lg">Everything a farmer needs for successful cultivation</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product, index) => (
              <div 
                key={index}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 text-center group cursor-pointer"
              >
                <div className="text-3xl mb-3 text-green-600 group-hover:scale-110 transition-transform">
                  {product.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-green-700 font-medium">{product.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-green-600">Journey</span> Timeline
            </h2>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-600"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div 
                  key={index}
                  className={`relative ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} md:w-1/2 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}
                >
                  {/* Mobile Timeline Dot */}
                  <div className="md:hidden absolute left-0 top-6 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                  
                  {/* Desktop Timeline Dot */}
                  <div className="hidden md:block absolute top-6 w-6 h-6 bg-green-500 rounded-full border-4 border-white"
                    style={{ 
                      left: index % 2 === 0 ? 'calc(50% + 12px)' : 'calc(50% - 12px)',
                      transform: 'translateX(-50%)' 
                    }}
                  ></div>
                  
                  <div className="ml-6 md:ml-0">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <div className="text-green-600 font-bold text-lg mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your Harvest?
            </h2>
            
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of successful farmers who trust Kuntal Agro Expert for their farming needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-700 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <FaPhoneAlt className="mr-2" />
                Call Now: +91 XXXXX XXXXX
              </button>
              
              <button className="bg-green-800 text-white font-bold px-8 py-4 rounded-full hover:bg-green-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <FaWhatsapp className="mr-2" />
                Message on WhatsApp
              </button>
            </div>
            
            <div className="mt-8 text-green-200 text-sm">
              <p>📍 Sohna, Gurugram | 🕒 Mon-Sat: 8AM-8PM | 🌱 Udyam Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Contact Button for Mobile */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300 animate-bounce">
            <FaPhoneAlt className="text-xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OurStory;