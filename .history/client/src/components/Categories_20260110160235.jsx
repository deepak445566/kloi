import React from "react";
import { assets, categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { FaLeaf, FaTractor, FaSeedling, FaSprayCan, FaTools, FaHome, FaBug, FaTree, FaFlask } from "react-icons/fa";

function Categories() {
  const { navigate } = useAppContext();
  
  // Function to handle category click
  const handleCategoryClick = (category) => {
    navigate(`/products/${category.id || category.text.toLowerCase()}`);
    window.scrollTo(0, 0);
  };

  // Category icon mapping with React Icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Crop": <FaSeedling className="text-xl sm:text-2xl" />,
      "Fertilizer": <FaFlask className="text-xl sm:text-2xl" />,
      "Pesticide": <FaBug className="text-xl sm:text-2xl" />,
      "Household Items": <FaHome className="text-xl sm:text-2xl" />,
      "Sprayers": <FaSprayCan className="text-xl sm:text-2xl" />,
      "Sprayers Parts": <FaTools className="text-xl sm:text-2xl" />,
      "Terrace Gardening": <FaLeaf className="text-xl sm:text-2xl" />,
      "Household Insecticides": <FaBug className="text-xl sm:text-2xl" />,
      "Farm Machinery": <FaTractor className="text-xl sm:text-2xl" />,
      "Plantation": <FaTree className="text-xl sm:text-2xl" />
    };
    return iconMap[categoryName] || <FaLeaf className="text-xl sm:text-2xl" />;
  };

  return (
    <div className="mt-12 sm:mt-16 mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Browse Our <span className="text-green-700">Agricultural</span> Categories
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
          Everything you need for modern farming and gardening in one place
        </p>
        <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-400 rounded-full mx-auto mt-3 sm:mt-4"></div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
        {categories.map((category, index) => (
          <div
            key={category.id || index}
            className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-[0.98] active:bg-green-50"
            onClick={() => handleCategoryClick(category)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick(category);
              }
            }}
            aria-label={`Browse ${category.text} products`}
          >
            {/* Background with gradient overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300"
            />
            
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-xl sm:rounded-bl-2xl" />
            
            {/* Category Content */}
            <div className="relative p-3 sm:p-4 md:p-5 flex flex-col items-center text-center h-full">
              {/* Icon Container */}
              <div className="mb-2 sm:mb-3 md:mb-4 p-2 sm:p-3 md:p-4 rounded-full bg-white shadow-md sm:shadow-lg group-hover:shadow-lg sm:group-hover:shadow-xl transition-shadow duration-300">
                <div className="text-green-700 group-hover:text-green-800 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.text}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    getCategoryIcon(category.text)
                  )}
                </div>
              </div>
              
              {/* Category Name */}
              <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-green-800 transition-colors duration-300 line-clamp-2 min-h-[2.5em]">
                {category.text}
              </h3>
              
              {/* Optional Category Description */}
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 flex-grow line-clamp-2">
                {category.description || "High quality products"}
              </p>
              
              {/* View Products Button */}
              <div className="flex items-center justify-center text-green-700 font-medium text-xs sm:text-sm group-hover:text-green-800 mt-auto">
                <span>View Products</span>
                <svg 
                  className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              {/* Product Count (Optional) */}
              {category.count && (
                <div className="mt-2 sm:mt-3 px-2 py-1 sm:px-3 sm:py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {category.count} {window.innerWidth < 640 ? 'items' : 'products'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Swipe indicator for mobile (optional) */}
      <div className="lg:hidden text-center mt-6">
        <div className="inline-flex items-center text-gray-500 text-sm">
          <span className="mr-2">Swipe to see more</span>
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Categories;