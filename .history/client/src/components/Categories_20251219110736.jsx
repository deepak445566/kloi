import React from "react";
import { assets, categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Categories() {
  const { navigate } = useAppContext();
  
  // Function to get color based on category
  const getCategoryColor = (category) => {
    const colorMap = {
      "Crop": "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      "Fertilizer": "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      "Pesticide": "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
      "Household Items": "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      "Sprayers": "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
      "Sprayers Parts": "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200",
      "Terrace Gardening": "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
      "Household Insecticides": "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
      "Farm Machinery": "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300",
      "Plantation": "bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200"
    };
    
    return colorMap[category] || "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300";
  };

  // Function to get emoji for category
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      "Crop": "🌱",
      "Fertilizer": "🧪",
      "Pesticide": "🐛",
      "Household Items": "🏠",
      "Sprayers": "💦",
      "Sprayers Parts": "🔧",
      "Terrace Gardening": "🏡",
      "Household Insecticides": "🦟",
      "Farm Machinery": "🚜",
      "Plantation": "🌴"
    };
    
    return emojiMap[category] || "📦";
  };

  // Function to handle category click
  const handleCategoryClick = (category) => {
    navigate(`/products/${category.text.toLowerCase()}`);
    scrollTo(0, 0);
  };

  // Function to handle subcategory click
  const handleSubcategoryClick = (mainCategory, subCategory) => {
    navigate(`/products/${mainCategory.toLowerCase()}/${subCategory.toLowerCase()}`);
    scrollTo(0, 0);
  };

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl md:text-3xl font-bold text-gray-900">Shop By Category</p>
        <div className="w-16 h-1 bg-primary rounded-full"></div>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group relative cursor-pointer py-5 px-3 rounded-xl flex flex-col justify-center items-center border transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ 
              backgroundColor: category.bgColor || "#ffffff",
              borderColor: category.bgColor ? category.bgColor + "80" : "#e5e7eb"
            }}
            onClick={() => handleCategoryClick(category)}
          >
            {/* Category Icon/Image */}
            <div className="relative">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.text}
                  className="transition-transform duration-300 group-hover:scale-110 max-w-20"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-3xl">
                  {getCategoryEmoji(category.text)}
                </div>
              )}
              
              {/* Subcategory Indicator */}
              {category.subItems && category.subItems.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  {category.subItems.length}
                </div>
              )}
            </div>
            
            {/* Category Name */}
            <p className="text-sm font-semibold mt-3 text-center text-gray-800">
              {category.text}
            </p>
            
            {/* Subcategories Preview (on hover) */}
            {category.subItems && category.subItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Subcategories:</p>
                  <div className="space-y-1">
                    {category.subItems.slice(0, 3).map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        className="text-xs p-2 rounded hover:bg-gray-50 cursor-pointer transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubcategoryClick(category.text, subItem.text);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <span>{subItem.text}</span>
                        </div>
                      </div>
                    ))}
                    {category.subItems.length > 3 && (
                      <div className="text-xs text-gray-400 p-2">
                        +{category.subItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Subcategories Section (for categories with subcategories) */}
      <div className="mt-12">
        {categories.filter(cat => cat.subItems && cat.subItems.length > 0).map((category, catIndex) => (
          <div key={catIndex} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-gray-900">{category.text} Subcategories</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="group cursor-pointer p-4 rounded-lg border bg-white hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center"
                  style={{ 
                    borderColor: category.bgColor ? category.bgColor + "40" : "#e5e7eb"
                  }}
                  onClick={() => handleSubcategoryClick(category.text, subItem.text)}
                >
                  {/* Subcategory Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                    style={{ 
                      backgroundColor: category.bgColor ? category.bgColor + "20" : "#f3f4f6"
                    }}
                  >
                    {category.text === "Fertilizer" && subItem.text === "Organic" && "🌱"}
                    {category.text === "Fertilizer" && subItem.text === "Non-organic" && "⚗️"}
                    {category.text === "Crop" && subItem.text === "Field Crop" && "🌾"}
                    {category.text === "Crop" && subItem.text === "Vegetable Crop" && "🥦"}
                    {category.text === "Pesticide" && subItem.text === "Herbicides" && "🚫"}
                    {category.text === "Pesticide" && subItem.text === "Insecticides" && "🐛"}
                    {category.text === "Pesticide" && subItem.text === "Fungicides" && "🍄"}
                  </div>
                  
                  {/* Subcategory Name */}
                  <p className="text-sm font-medium text-gray-800 text-center">
                    {subItem.text}
                  </p>
                  
                  {/* Parent Category */}
                  <p className="text-xs text-gray-500 mt-1">
                    {category.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;