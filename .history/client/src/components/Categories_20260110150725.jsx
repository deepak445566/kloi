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
      "Crop": <FaSeedling className="text-2xl" />,
      "Fertilizer": <FaFlask className="text-2xl" />,
      "Pesticide": <FaBug className="text-2xl" />,
      "Household Items": <FaHome className="text-2xl" />,
      "Sprayers": <FaSprayCan className="text-2xl" />,
      "Sprayers Parts": <FaTools className="text-2xl" />,
      "Terrace Gardening": <FaLeaf className="text-2xl" />,
      "Household Insecticides": <FaBug className="text-2xl" />,
      "Farm Machinery": <FaTractor className="text-2xl" />,
      "Plantation": <FaTree className="text-2xl" />
    };
    return iconMap[categoryName] || <FaLeaf className="text-2xl" />;
  };

  return (
    <div className="mt-16 mb-12">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Browse Our <span className="text-green-700">Agricultural</span> Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need for modern farming and gardening in one place
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-400 rounded-full mx-auto mt-4"></div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {categories.map((category, index) => (
          <div
            key={category.id || index}
            className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            onClick={() => handleCategoryClick(category)}
          >
            {/* Background with gradient overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300"
            />
            
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-2xl" />
            
            {/* Category Content */}
            <div className="relative p-5 flex flex-col items-center text-center h-full">
              {/* Icon Container */}
              <div className="mb-4 p-4 rounded-full bg-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="text-green-700 group-hover:text-green-800 group-hover:scale-110 transition-transform duration-300">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.text}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    getCategoryIcon(category.text)
                  )}
                </div>
              </div>
              
              {/* Category Name */}
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-green-800 transition-colors duration-300">
                {category.text}
              </h3>
              
              {/* Optional Category Description */}
              <p className="text-sm text-gray-600 mb-4 flex-grow">
                {category.description || "High quality products"}
              </p>
              
              {/* View Products Button */}
              <div className="flex items-center justify-center text-green-700 font-medium text-sm group-hover:text-green-800 mt-2">
                <span>View Products</span>
                <svg 
                  className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              {/* Product Count (Optional) */}
              {category.count && (
                <div className="mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {category.count} products
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Featured Category Banner (Optional) */}
      <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h3 className="text-2xl font-bold mb-2">Need Farming Equipment?</h3>
            <p className="text-green-100 mb-4">
              Explore our premium farm machinery and tools for maximum productivity
            </p>
            <button 
              onClick={() => navigate('/products/farm-machinery')}
              className="bg-white text-green-800 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Browse Machinery
            </button>
          </div>
          <div className="hidden md:block">
            <FaTractor className="text-8xl opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;