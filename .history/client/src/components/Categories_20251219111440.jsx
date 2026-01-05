import React from "react";
import { assets, categories } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

function Categories() {
  const { navigate } = useAppContext();
  
  // Function to handle category click
  const handleCategoryClick = (category) => {
    navigate(`/products/${category.text.toLowerCase()}`);
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
            className="group cursor-pointer py-5 px-3 rounded-xl flex flex-col justify-center items-center border transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
            </div>
            
            {/* Category Name */}
            <p className="text-sm font-semibold mt-3 text-center text-gray-800">
              {category.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export default Categories;