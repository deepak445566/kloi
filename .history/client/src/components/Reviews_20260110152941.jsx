import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaLeaf, FaTractor, FaCheckCircle } from 'react-icons/fa';
import { GiFarmer, GiWheat } from 'react-icons/gi';

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonials = [
    {
      id: 1,
      quote: "One-stop shop for all agri needs!",
      content: "I've been buying seeds and fertilizers from Kuntal Agro Agencies for the past two years. Their products are always fresh and genuine, and they give the right guidance for seasonal crops. The owner is polite and knowledgeable.",
      author: "SUPRIYA S",
      role: "Organic Farmer",
      location: "Sohna",
      rating: 5,
      avatarColor: "bg-green-100",
      icon: <GiFarmer className="text-xl" />,
      productType: "Seeds & Fertilizers"
    },
    {
      id: 2,
      quote: "Excellent customer service and quality products",
      content: "Visited their shop near Sohna Sabzi Mandi last month and was impressed. They stock top brands and even offer organic options. Prices are fair, and they don't push unnecessary items. Trustworthy place for all types of farm inputs",
      author: "KANIKA K",
      role: "Commercial Farmer",
      location: "Gurugram",
      rating: 5,
      avatarColor: "bg-yellow-100",
      icon: <GiWheat className="text-xl" />,
      productType: "Organic Products"
    },
    {
      id: 3,
      quote: "Reliable dealer for fertilizers and pesticides",
      content: "Kuntal Agro Agencies helped me control pests in my wheat crop with the right advice and products. They not only sold me the pesticides but also told me the exact dosage and timing. You don't get that kind of service everywhere. Thanks a lot!",
      author: "JAGJEET SINGH",
      role: "Wheat Farmer",
      location: "Sohna",
      rating: 5,
      avatarColor: "bg-blue-100",
      icon: <FaLeaf className="text-xl" />,
      productType: "Pest Control"
    },
    {
      id: 4,
      quote: "Best prices for agricultural equipment",
      content: "Bought a sprayer and other farming tools. Quality is excellent and prices are better than other shops in the area. They also provide maintenance tips. Highly recommended for all farming equipment needs.",
      author: "RAJESH KUMAR",
      role: "Farm Equipment User",
      location: "Gurugram",
      rating: 5,
      avatarColor: "bg-orange-100",
      icon: <FaTractor className="text-xl" />,
      productType: "Farm Equipment"
    },
    {
      id: 5,
      quote: "Timely delivery and genuine products",
      content: "Ordered fertilizers during peak season and got them delivered on time. Products are original and effective. Their after-sales support is also very good. Will continue to buy from Kuntal Agro Expert.",
      author: "PRIYA SHARMA",
      role: "Vegetable Grower",
      location: "Sohna",
      rating: 5,
      avatarColor: "bg-purple-100",
      icon: <FaCheckCircle className="text-xl" />,
      productType: "Seasonal Supplies"
    }
  ];

  const stats = [
    { value: "500+", label: "Happy Farmers", icon: "👨‍🌾", color: "text-green-600" },
    { value: "4.9/5", label: "Customer Rating", icon: "⭐", color: "text-yellow-600" },
    { value: "100+", label: "Products", icon: "📦", color: "text-blue-600" },
    { value: "2+ Years", label: "Trusted Service", icon: "🤝", color: "text-emerald-600" },
  ];

  const renderStars = (count) => {
    return [...Array(count)].map((_, i) => (
      <FaStar key={i} className="w-5 h-5 text-yellow-500 fill-current" />
    ));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - (isMobile ? 1 : 3) ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - (isMobile ? 1 : 3) : prevIndex - 1
    );
  };

  const visibleTestimonials = isMobile 
    ? [testimonials[currentIndex]]
    : testimonials.slice(currentIndex, currentIndex + 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
              Customer Reviews
            </span>
            <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Farmers <span className="text-green-700">Say About Us</span>
          </h1>
          
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full mx-auto mb-6"></div>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real feedback from our farming community in Sohna & Gurugram
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="relative mb-12 md:mb-20">
          {/* Navigation Buttons */}
          {!isMobile && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 bg-white w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 hover:scale-110 transition-all duration-300 border border-gray-200"
              >
                <FaChevronLeft className="text-gray-700" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 bg-white w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 hover:scale-110 transition-all duration-300 border border-gray-200"
              >
                <FaChevronRight className="text-gray-700" />
              </button>
            </>
          )}

          {/* Testimonials Grid/Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {visibleTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="relative group"
              >
                {/* Decorative Quote Icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaQuoteLeft className="text-green-600 text-xl" />
                </div>
                
                {/* Testimonial Card */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100">
                  {/* Rating */}
                  <div className="flex mb-4 md:mb-6">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  {/* Quote */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                    "{testimonial.quote}"
                  </h3>
                  
                  {/* Content */}
                  <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                    {testimonial.content}
                  </p>
                  
                  {/* Product Type */}
                  <div className="inline-flex items-center bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-6">
                    {testimonial.icon}
                    <span className="ml-2">{testimonial.productType}</span>
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex items-center pt-6 border-t border-gray-100">
                    <div className={`${testimonial.avatarColor} w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
                      <span className="text-gray-800 font-bold text-lg">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.author}</div>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                        <span>{testimonial.role}</span>
                        <span className="mx-2">•</span>
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Dots */}
          {isMobile && (
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-green-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile Navigation Arrows */}
          {isMobile && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={prevTestimonial}
                className="bg-white w-10 h-10 rounded-full shadow flex items-center justify-center hover:bg-green-50 transition-all duration-300 border border-gray-200"
              >
                <FaChevronLeft className="text-gray-700" />
              </button>
              <button
                onClick={nextTestimonial}
                className="bg-white w-10 h-10 rounded-full shadow flex items-center justify-center hover:bg-green-50 transition-all duration-300 border border-gray-200"
              >
                <FaChevronRight className="text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 md:p-10 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Farmers <span className="text-green-700">Trust Us</span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our commitment to quality and farmer satisfaction sets us apart
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-green-600 text-3xl mb-4">🌱</div>
              <h4 className="font-bold text-gray-900 mb-2">Genuine Products</h4>
              <p className="text-gray-600 text-sm">100% authentic agricultural inputs</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-green-600 text-3xl mb-4">💬</div>
              <h4 className="font-bold text-gray-900 mb-2">Expert Guidance</h4>
              <p className="text-gray-600 text-sm">Professional advice for better yield</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-green-600 text-3xl mb-4">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">Fair Pricing</h4>
              <p className="text-gray-600 text-sm">Competitive prices without compromise</p>
            </div>
          </div>
        </div>

      

       
      </div>
    </div>
  );
};

export default Reviews;