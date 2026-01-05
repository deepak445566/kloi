import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

function Productcato() {
  const { products } = useAppContext();
  const { category } = useParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  
  const serchcato = categories.find((item) => item.text.toLowerCase() === category?.toLowerCase());
  
  // Get subcategories for current category
  const subCategories = serchcato?.subItems || [];
  
  // Filter products based on category and selected subcategory
  const filterProducts = () => {
    let filtered = products.filter((pro) => 
      pro.category.toLowerCase() === category?.toLowerCase()
    );
    
    // If subcategory is selected and not "all", filter further
    if (selectedSubCategory !== "all" && subCategories.length > 0) {
      filtered = filtered.filter((pro) => 
        pro.subCategory?.toLowerCase() === selectedSubCategory?.toLowerCase()
      );
    }
    
    return filtered;
  };
  
  const filteredProducts = filterProducts();

  return (
    <>
      <div className='mt-16'>
        {serchcato && (
          <div className='mb-6'>
            <div className='flex flex-col items-start w-max'>
              <p className='text-2xl font-medium'>{serchcato.text.toUpperCase()}</p>
              <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>
            
            {/* Subcategory Filter (only show if category has subcategories) */}
            {subCategories.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-lg font-medium text-gray-700">Filter by Type:</p>
                  <div className="flex flex-wrap gap-2">
                    {/* All option */}
                    <button
                      onClick={() => setSelectedSubCategory("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedSubCategory === "all" 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All {serchcato.text}
                    </button>
                    
                    {/* Subcategory options */}
                    {subCategories.map((subCat, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSubCategory(subCat.text)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          selectedSubCategory === subCat.text 
                            ? getSubCategoryColor(serchcato.text, subCat.text) + " font-bold"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {getSubCategoryEmoji(serchcato.text, subCat.text)} {subCat.text}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Selected filter info */}
                {selectedSubCategory !== "all" && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700">
                      Showing: <span className="font-bold">{selectedSubCategory}</span> 
                      <span className="text-gray-600"> in {serchcato.text} category</span>
                    </p>
                    <button 
                      onClick={() => setSelectedSubCategory("all")}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-6 md:gap-6 gap-3'>
            {filteredProducts.map((pro) => (
              <ProductCard key={pro._id} product={pro}/>
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center h-[60vh]'>
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-2">No products found</p>
              {selectedSubCategory !== "all" ? (
                <p className="text-gray-500">
                  No {selectedSubCategory} products in {serchcato?.text} category
                </p>
              ) : (
                <p className="text-gray-500">
                  No products in {serchcato?.text} category
                </p>
              )}
              {selectedSubCategory !== "all" && (
                <button 
                  onClick={() => setSelectedSubCategory("all")}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                >
                  View all {serchcato?.text}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Helper functions for subcategory styling
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

export default Productcato;