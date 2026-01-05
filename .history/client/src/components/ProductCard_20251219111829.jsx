import React from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

function ProductCard({ product }) {
  const { addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  const currency = "₹";

  // Function to check if product category has subcategories
  const hasSubcategory = ["Crop", "Fertilizer", "Pesticide"].includes(product.category);

  // Function to get color based on category
  const getCategoryColor = (category) => {
    const colorMap = {
      "Crop": "bg-green-50 text-green-800 border-green-200",
      "Fertilizer": "bg-blue-50 text-blue-800 border-blue-200",
      "Pesticide": "bg-red-50 text-red-800 border-red-200",
      "Household Items": "bg-purple-50 text-purple-800 border-purple-200",
      "Sprayers": "bg-amber-50 text-amber-800 border-amber-200",
      "Sprayers Parts": "bg-cyan-50 text-cyan-800 border-cyan-200",
      "Terrace Gardening": "bg-emerald-50 text-emerald-800 border-emerald-200",
      "Household Insecticides": "bg-orange-50 text-orange-800 border-orange-200",
      "Farm Machinery": "bg-gray-100 text-gray-800 border-gray-300",
      "Plantation": "bg-lime-50 text-lime-800 border-lime-200"
    };
    
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Function to get subcategory color
  const getSubCategoryColor = (category, subCategory) => {
    if (category === "Fertilizer") {
      if (subCategory === "Organic") return "bg-green-100 text-green-900 border-green-300";
      if (subCategory === "Non-organic") return "bg-yellow-100 text-yellow-900 border-yellow-300";
    }
    
    if (category === "Crop") {
      if (subCategory === "Field Crop") return "bg-teal-100 text-teal-900 border-teal-300";
      if (subCategory === "Vegetable Crop") return "bg-emerald-100 text-emerald-900 border-emerald-300";
    }
    
    if (category === "Pesticide") {
      if (subCategory === "Herbicides") return "bg-red-100 text-red-900 border-red-300";
      if (subCategory === "Insecticides") return "bg-orange-100 text-orange-900 border-orange-300";
      if (subCategory === "Fungicides") return "bg-purple-100 text-purple-900 border-purple-300";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Function to get emoji for subcategory
  const getSubCategoryEmoji = (category, subCategory) => {
    if (category === "Fertilizer") {
      if (subCategory === "Organic") return "🌱";
      if (subCategory === "Non-organic") return "⚗️";
    }
    
    if (category === "Crop") {
      if (subCategory === "Field Crop") return "🌾";
      if (subCategory === "Vegetable Crop") return "🥦";
    }
    
    if (category === "Pesticide") {
      if (subCategory === "Herbicides") return "🚫";
      if (subCategory === "Insecticides") return "🐛";
      if (subCategory === "Fungicides") return "🍄";
    }
    
    return "";
  };

  return product && (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="border border-gray-500/20 rounded-md px-3 md:px-4 py-3 bg-white w-full max-w-[16rem] hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="group cursor-pointer flex items-center justify-center px-2">
        <img
          className="group-hover:scale-105 transition-transform max-w-[6.5rem] md:max-w-[9rem] h-30"
          src={product.image[0]}
          alt={product.name}
        />
      </div>

      {/* Category/Subcategory - Image के नीचे */}
      <div className="mt-2 mb-2 ">
        {hasSubcategory && product.subCategory ? (
          <div className="flex items-center gap-1 ">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
            <span className="text-gray-400 text-xs">→</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getSubCategoryColor(product.category, product.subCategory)}`}>
              {getSubCategoryEmoji(product.category, product.subCategory)} {product.subCategory}
            </span>
          </div>
        ) : (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(product.category)}`}>
            📦 {product.category}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="text-gray-500/60 text-sm">
        {/* Product Name with Hover Effect */}
        <div className="relative group/name">
          <p className="text-gray-900 font-bold text-lg truncate w-full hover:text-primary transition-colors duration-200">
            {product.name}
          </p>
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover/name:w-full transition-all duration-300"></div>
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-0.5 mt-1">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                className="md:w-3.5 w-3"
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="star"
              />
            ))}
          <p className="text-gray-500 text-xs">({4})</p>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="md:text-xl text-base font-bold text-primary">
              {currency}
              {product.offerPrice}{" "}
            </p>
            {product.offerPrice < product.price && (
              <span className="text-gray-500/60 md:text-sm text-xs line-through block">
                {currency}
                {product.price}
              </span>
            )}
            {product.offerPrice < product.price && (
              <span className="text-green-600 text-xs font-medium block mt-1">
                Save ₹{product.price - product.offerPrice}
              </span>
            )}
          </div>

          {/* Cart Button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-primary"
          >
            {!cartItems[product._id] ? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded hover:bg-primary/20 transition"
                onClick={() => addToCart(product._id)}
              >
                <img src={assets.cart_icon} className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/20 rounded select-none">
                <button
                  onClick={() => {
                    removeFromCart(product._id);
                  }}
                  className="cursor-pointer text-md px-2 h-full hover:bg-primary/30 rounded-l"
                >
                  -
                </button>
                <span className="w-5 text-center font-medium">{cartItems[product._id]}</span>
                <button
                  onClick={() => {
                    addToCart(product._id);
                  }}
                  className="cursor-pointer text-md px-2 h-full hover:bg-primary/30 rounded-r"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;