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
  FaChevronRight,
  FaPhone,
  FaWhatsapp
} from 'react-icons/fa';
import { GiWheat, GiFarmer } from 'react-icons/gi';

const OurStory = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Statistics data - mobile responsive
  const stats = [
    { 
      icon: <FaCalendarAlt />, 
      value: '5+', 
      label: 'Years Experience',
      mobileLabel: '5+ Years',
      color: 'text-green-600' 
    },
    { 
      icon: <FaUsers />, 
      value: '5000+', 
      label: 'Happy Farmers',
      mobileLabel: '5000+ Farmers',
      color: 'text-yellow-600' 
    },
    { 
      icon: <FaLeaf />, 
      value: '100+', 
      label: 'Products',
      mobileLabel: '100+ Products',
      color: 'text-green-600' 
    },
    { 
      icon: <GiFarmer />, 
      value: '24/7', 
      label: 'Farmer Support',
      mobileLabel: '24/7 Support',
      color: 'text-yellow-600' 
    },
  ];

  // Values list - optimized for mobile
  const values = [
    {
      icon: <FaCheckCircle />,
      title: 'Quality First',
      description: 'Genuine & certified products for maximum yield',
      mobileDescription: 'Genuine certified products'
    },
    {
      icon: <GiFarmer />,
      title: 'Farmer First',
      description: 'Tailored solutions for local farming needs',
      mobileDescription: 'Tailored local solutions'
    },
    {
      icon: <FaLeaf />,
      title: 'Sustainable',
      description: 'Promoting eco-friendly farming practices',
      mobileDescription: 'Eco-friendly practices'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Trusted',
      description: 'Building relationships on trust & results',
      mobileDescription: 'Trust & reliability'
    }
  ];

  // Products list for mobile swipe
  const products = [
    { name: 'Fertilizers', icon: <GiWheat />, color: 'bg-green-500' },
    { name: 'Pesticides', icon: <FaSprayCan />, color: 'bg-emerald-500' },
    { name: 'Seeds', icon: <FaSeedling />, color: 'bg-lime-500' },
    { name: 'Equipment', icon: <FaTractor />, color: 'bg-yellow-500' },
    { name: 'Irrigation', icon: '💦', color: 'bg-blue-500' },
    { name: 'Tools', icon: '🔧', color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-green-50 min-h-screen pt-6 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile-Friendly Header */}
        <header className="mb-10 md:mb-16">
          <div className="text-center">
            {/* Logo/Brand for Mobile */}
            <div className="flex justify-center mb-4 md:hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                <FaSeedling className="text-white text-3xl" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4">
              Our <span className="text-green-700">Story</span>
            </h1>
            
            <div className="relative">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium mb-6 px-2">
                Empowering Farmers Since 2018
              </p>
              
              {/* Mobile Tagline */}
              <p className="text-green-800 font-semibold text-sm sm:text-base md:hidden mb-4">
                Kuntal Agro Expert • Sohna, Gurugram
              </p>
            </div>
            
            {/* Decorative Divider */}
            <div className="flex justify-center items-center mt-4 space-x-3">
              <div className="w-8 h-1 bg-green-500 rounded-full"></div>
              <FaLeaf className="text-green-600 text-lg" />
              <div className="w-8 h-1 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Main Content Grid - Mobile Stack */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 mb-12 md:mb-20">
          
          {/* Left Column - Visual Section */}
          <div className="mb-12 lg:mb-0 order-2 lg:order-1">
            {/* Mobile Compact Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8 lg:hidden">
              {stats.slice(0, 2).map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <div className={`text-2xl mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600 font-medium">{stat.mobileLabel}</div>
                </div>
              ))}
            </div>

            {/* Main Image Card */}
            <div className="relative group">
              {/* Card with Gradient Border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                {/* Brand Display */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-md opacity-20"></div>
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg">
                      <FaSeedling className="text-white text-4xl sm:text-5xl" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
                    KUNTAL AGRO EXPERT
                  </h2>
                  <p className="text-green-700 font-semibold text-center mb-4">
                    Your Trusted Farming Partner
                  </p>
                  
                  {/* Location & Contact Mobile */}
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                      <FaMapMarkerAlt className="text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-800">Sohna, Gurugram</span>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-full">
                      <FaCalendarAlt className="text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-800">Since 2018</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Contact CTA for Mobile */}
                <div className="lg:hidden bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Need Farming Supplies?</h3>
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center">
                      <FaPhone className="mr-2" />
                      Call Now
                    </button>
                    <button className="flex-1 bg-green-100 text-green-800 font-semibold py-3 rounded-lg flex items-center justify-center">
                      <FaWhatsapp className="mr-2 text-green-600" />
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Products Grid for Mobile */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Our Products Range</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {products.slice(0, 6).map((product, index) => (
                      <div 
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 text-center hover:bg-green-50 transition-colors"
                      >
                        <div className={`${product.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <span className="text-white text-xl">
                            {product.icon}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content Section */}
          <div className="order-1 lg:order-2">
            {/* Introduction */}
            <div className="mb-8 lg:mb-12">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                  Our Journey
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">
                Growing Together with Farmers
              </h2>
              
              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                <p className="bg-green-50/50 p-4 rounded-lg border-l-4 border-green-500">
                  <span className="font-bold text-green-800">Kuntal Agro Agencies</span> began in October 2018 with a mission to provide farmers with 
                  <span className="text-yellow-700 font-semibold"> genuine, high-quality agricultural supplies</span> that deliver real results.
                </p>
                
                <p>
                  Registered as a Udyam Micro-Enterprise, we operate under the trusted identity of{' '}
                  <span className="font-bold text-green-800">"Kuntal Agro Expert"</span> — a name that 
                  farmers rely on for all farming needs.
                </p>
                
                <p>
                  From seeds and fertilizers to modern equipment and expert advice, we've grown into a 
                  comprehensive farming solutions provider serving Sohna and Gurugram.
                </p>
              </div>
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`text-3xl mb-3 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Values Section - Mobile Carousel Style */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start">
                      <div className="bg-green-50 p-3 rounded-lg mr-4 group-hover:bg-green-100 transition-colors flex-shrink-0">
                        <div className="text-green-600 text-xl">
                          {value.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{value.title}</h4>
                        <p className="text-gray-600 text-sm hidden sm:block">{value.description}</p>
                        <p className="text-gray-600 text-sm sm:hidden">{value.mobileDescription}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Vision/Mission Combined */}
            <div className="lg:hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Promise</h3>
              <p className="text-gray-700 mb-4">
                To empower every farmer with accessible, high-quality agricultural inputs and 
                expert guidance for sustainable farming and improved livelihoods.
              </p>
              <div className="flex items-center text-green-700 font-semibold">
                <span>Learn More</span>
                <FaChevronRight className="ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Desktop Only */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-green-600 p-3 rounded-xl mr-4">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To empower every farmer with accessible, high-quality agricultural inputs and 
              expert guidance that enhances productivity and ensures sustainable farming practices.
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-600 p-3 rounded-xl mr-4">
                <FaTractor className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To become the most trusted agricultural partner, revolutionizing farming through 
              innovation and community-focused solutions that bridge traditional wisdom with modern technology.
            </p>
          </div>
        </div>

        {/* Certification & CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl mr-4">
                <FaAward className="text-white text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Udyam Certified Enterprise</h4>
                <p className="text-gray-600 text-sm">Government Recognized • Trusted Quality</p>
              </div>
            </div>
            
            {/* Mobile Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center">
                <FaPhone className="mr-2" />
                Call for Enquiry
              </button>
              <button className="bg-white border border-green-300 text-green-700 font-semibold py-3 px-6 rounded-full hover:bg-green-50 active:scale-95 transition-all duration-300 flex items-center justify-center">
                <FaWhatsapp className="mr-2 text-green-600" />
                WhatsApp
              </button>
            </div>
          </div>
          
          {/* Mobile Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 md:hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">5+</div>
                <div className="text-gray-600 text-sm">Years Serving</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">Udyam</div>
                <div className="text-gray-600 text-sm">Registered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300 animate-bounce">
            <FaPhone className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OurStory;