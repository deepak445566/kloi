import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { products, navigate, currency, addToCart } = useAppContext();
  const { id } = useParams();
  const [related, setRelated] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [showSubcategory, setShowSubcategory] = useState(false);

  const product = products.find((item) => item._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      let productcopy = products.slice();

      // Check if product belongs to a category that has subcategories
      // Main categories with subcategories: Crop, Fertilizer, Pesticide
      const hasSubcategories = ["Crop", "Fertilizer", "Pesticide"].includes(product.category);
      setShowSubcategory(hasSubcategories);

      if (hasSubcategories && product.subCategory) {
        // If product has subCategory, filter by both category AND subCategory
        productcopy = productcopy.filter((item) => 
          product.category === item.category && 
          product.subCategory === item.subCategory
        );
      } else {
        // Otherwise filter only by main category
        productcopy = productcopy.filter((item) => product.category === item.category);
      }

      // Remove current product from related
      productcopy = productcopy.filter((item) => item._id !== product._id);

      setRelated(productcopy.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    setThumbnail(product?.image[0] ? product.image[0] : null);
  }, [product]);

  // Function to create breadcrumb path
  const getBreadcrumbPath = () => {
    if (!product) return "";

    // Check if product belongs to a category that has subcategories
    const hasSubcategories = ["Crop", "Fertilizer", "Pesticide"].includes(product.category);
    
    if (hasSubcategories && product.subCategory) {
      return `/products/${product.category.toLowerCase()}/${product.subCategory.toLowerCase()}`;
    }

    return `/products/${product.category.toLowerCase()}`;
  };

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

  // Function to get subcategory color based on main category and subcategory
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

  return product && (
    <div className="mt-12">
      {/* Breadcrumb Navigation */}
      <p className="text-gray-600">
        <Link to={"/"} className="hover:text-primary">Home</Link> /
        <Link to={"/products"} className="hover:text-primary"> Products</Link> /
        <Link to={getBreadcrumbPath()} className="hover:text-primary">
          {product.subCategory && showSubcategory
            ? ` ${product.category} > ${product.subCategory}`
            : ` ${product.category}`}
        </Link> /
        <span className="text-primary font-medium"> {product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        {/* Product Images Section */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.image.map((image, index) => (
              <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer hover:border-primary transition" >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img src={thumbnail} alt="Selected product" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium text-gray-900">{product.name}</h1>

          {/* Category and Subcategory Display - Highlighted badges */}
          <div className="mt-4 flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg border text-sm font-medium ${getCategoryColor(product.category)}`}>
              📦 {product.category}
            </span>
            
            {product.subCategory && showSubcategory && (
              <span className={`px-4 py-2 rounded-lg border text-sm font-medium ${getSubCategoryColor(product.category, product.subCategory)}`}>
                {product.category === "Fertilizer" && product.subCategory === "Organic" && "🌱 "}
                {product.category === "Fertilizer" && product.subCategory === "Non-organic" && "⚗️ "}
                {product.category === "Crop" && product.subCategory === "Field Crop" && "🌾 "}
                {product.category === "Crop" && product.subCategory === "Vegetable Crop" && "🥦 "}
                {product.category === "Pesticide" && product.subCategory === "Herbicides" && "🚫 "}
                {product.category === "Pesticide" && product.subCategory === "Insecticides" && "🐛 "}
                {product.category === "Pesticide" && product.subCategory === "Fungicides" && "🍄 "}
                {product.subCategory}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mt-6">
            {Array(5).fill('').map((_, i) => (
              product.rating > i ? (
                <img src={assets.star_icon} alt="star" className="w-5 h-5" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill="#4FBF8B" fillOpacity="0.35" />
                </svg>
              )
            ))}
            <p className="text-base ml-2 text-gray-600">({4})</p>
          </div>

          {/* Pricing */}
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
            <p className="text-gray-500/70 line-through text-lg">MRP: {currency}{product.price}</p>
            <p className="text-3xl font-bold text-primary mt-1">₹{product.offerPrice}</p>
            <span className="text-gray-500/70 text-sm">(inclusive of all taxes)</span>
            {product.offerPrice < product.price && (
              <div className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🎉 You save ₹{product.price - product.offerPrice}
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="mt-8">
            <p className="text-xl font-semibold text-gray-800 mb-3">About Product</p>
            <ul className="list-disc ml-5 text-gray-700 space-y-2">
              {product.description.map((desc, index) => (
                <li key={index} className="leading-relaxed">{desc}</li>
              ))}
            </ul>
          </div>

          {/* Category Information Display - Enhanced */}
          {showSubcategory && (
            <div className="mt-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-lg font-semibold text-gray-800">Product Category Information</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500">📂</span>
                    <span className="font-medium text-gray-700">Main Category</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded text-sm font-medium inline-block ${getCategoryColor(product.category).replace('border-', 'border ')}`}>
                    {product.category}
                  </span>
                </div>
                {product.subCategory && (
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500">🗂️</span>
                      <span className="font-medium text-gray-700">Sub Category</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded text-sm font-medium inline-block ${getSubCategoryColor(product.category, product.subCategory).replace('border-', 'border ')}`}>
                      {product.subCategory}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center mt-10 gap-4 text-base">
            <button onClick={() => addToCart(product._id)} className="w-full py-4 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded-lg border border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2">
              <span>🛒</span> Add to Cart
            </button>
            <button onClick={() => { addToCart(product._id); navigate("/cart") }} className="w-full py-4 cursor-pointer font-medium bg-primary text-white hover:bg-primary/90 transition rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span>⚡</span> Buy now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max mb-2">
          <p className="text-3xl font-bold text-gray-900">
            {product.subCategory && showSubcategory
              ? `More in ${product.subCategory}`
              : `More in ${product.category}`}
          </p>
          <div className="w-24 h-1 bg-primary rounded-full mt-2"></div>
        </div>
        
        {related.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-8 md:gap-6 gap-4">
            {related.filter((item) => item.inStock).map((pro, index) => (
              <ProductCard key={index} product={pro} />
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center p-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No related products found</p>
            <p className="text-gray-400 mt-2">Check back later for more products in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;