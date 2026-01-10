import React from 'react';
import { useState } from 'react';
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
  FaShieldAlt
} from 'react-icons/fa';

const OurStory = () => {
  // State for image loading
  const [imageLoaded] = useState(true);

  // Statistics data
  const stats = [
    { icon: <FaCalendarAlt />, value: '5+', label: 'Years of Service', color: 'text-green-600' },
    { icon: <FaUsers />, value: '5000+', label: 'Happy Farmers', color: 'text-yellow-600' },
    { icon: <FaLeaf />, value: '100+', label: 'Products', color: 'text-green-600' },
    { icon: <FaMapMarkerAlt />, value: '2', label: 'Regions Served', color: 'text-yellow-600' },
  ];

  // Values list
  const values = [
    {
      icon: <FaCheckCircle />,
      title: 'Quality Assurance',
      description: 'Only genuine and certified products for maximum yield'
    },
    {
      icon: <FaUsers />,
      title: 'Farmer First',
      description: 'Solutions tailored to local farming needs'
    },
    {
      icon: <FaLeaf />,
      title: 'Sustainable Farming',
      description: 'Promoting eco-friendly agricultural practices'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Trust & Reliability',
      description: 'Building relationships based on trust and results'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-green-50 min-h-screen py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section with Background */}
        <div className="relative mb-16 text-center overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-emerald-800 py-12 px-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500 rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500 rounded-full translate-x-32 translate-y-32"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-yellow-300">Story</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 font-medium max-w-3xl mx-auto">
              Empowering Farmers, Enriching Lives Since 2018
            </p>
            
            {/* Decorative Divider */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
              <FaLeaf className="text-yellow-400 text-2xl" />
              <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 items-center">
          
          {/* Left Column - Image/Visual */}
          <div className="relative group">
            {/* Main Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="aspect-square bg-gradient-to-br from-green-100 via-emerald-50 to-yellow-50 p-8">
                <div className="relative w-full h-full">
                  {/* Logo/Brand Display */}
                  <div className="absolute inset-8 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-xl"></div>
                  
                  {/* Central Brand Element */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="relative mb-6">
                      {/* Outer Circle */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-yellow-500 blur-md opacity-30 animate-pulse"></div>
                      
                      {/* Inner Circle with Icon */}
                      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg">
                        <FaSeedling className="text-5xl text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                      KUNTAL AGRO EXPERT
                    </h2>
                    <p className="text-green-700 font-semibold text-lg text-center">
                      Your Trusted Farming Partner
                    </p>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-4 text-green-600">
                      <FaLeaf className="text-3xl" />
                    </div>
                    <div className="absolute top-4 right-4 text-yellow-600">
                      <FaTractor className="text-3xl" />
                    </div>
                    <div className="absolute bottom-4 left-4 text-green-500">
                      <FaSprayCan className="text-3xl" />
                    </div>
                    <div className="absolute bottom-4 right-4 text-yellow-500">
                      <FaLeaf className="text-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location Badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 transform rotate-3">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaMapMarkerAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sohna, Gurugram</p>
                  <p className="text-sm text-gray-600">Since October 2018</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                  Our Journey
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                Growing Together with the Farming Community
              </h2>
              
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  <span className="font-bold text-green-800">Kuntal Agro Agencies</span> began its journey in October 2018 with a simple mission: 
                  to provide farmers in Sohna and Gurugram with <span className="text-yellow-700 font-semibold">genuine, high-quality agricultural supplies</span> 
                  that deliver real results in their fields.
                </p>
                
                <p>
                  Registered as a Udyam Micro-Enterprise, we operate under the trusted identity of{' '}
                  <span className="font-bold text-green-800">"Kuntal Agro Expert"</span> — a name that 
                  farmers have come to rely on for all their farming needs.
                </p>
                
                <p>
                  What started as a small agricultural supplies dealership has grown into a 
                  comprehensive farming solutions provider, offering everything from seeds and 
                  fertilizers to modern farming equipment and expert advice.
                </p>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`text-4xl mb-3 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Our Values */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg p-5 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
                        <div className="text-green-600 text-xl">
                          {value.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                        <p className="text-gray-600 text-sm">{value.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-green-600 p-3 rounded-xl mr-4">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              To empower every farmer with accessible, high-quality agricultural inputs and 
              expert guidance that enhances productivity, ensures sustainable farming practices, 
              and improves livelihoods across our community.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-600 p-3 rounded-xl mr-4">
                <FaTractor className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              To become the most trusted agricultural partner in Northern India, revolutionizing 
              farming through innovation, education, and community-focused solutions that bridge 
              traditional wisdom with modern technology.
            </p>
          </div>
        </div>

        {/* Product Range Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              A complete range of agricultural products designed for modern farming needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'Fertilizers', 'Pesticides', 'Seeds', 
              'Equipment', 'Irrigation', 'Farm Tools'
            ].map((product, index) => (
              <div 
                key={index}
                className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 text-center border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FaLeaf className="text-green-600 text-2xl" />
                </div>
                <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                  {product}
                </span>
              </div>
            ))}
          </div>
          
          {/* Certification Badge */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <FaAward className="text-yellow-500 text-3xl mr-4" />
              <div>
                <h4 className="font-bold text-gray-900">Udyam Certified Enterprise</h4>
                <p className="text-gray-600 text-sm">Government Recognized Micro-Enterprise</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
              Connect With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;