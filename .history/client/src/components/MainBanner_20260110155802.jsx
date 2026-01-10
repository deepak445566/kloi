import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { FaArrowRight, FaSeedling, FaShoppingCart, FaLeaf } from "react-icons/fa";

function MainBanner() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-emerald-900/20 z-10"></div>
      
      {/* Banner image */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        <img
          src="/lo.png"
          alt="Main banner"
          className="w-full h-full object-cover hidden md:block"
        />
        <img
          src="/mo.png"
          alt="Main banner mobile"
          className="w-full h-full object-cover md:hidden"
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-green-400 opacity-20">
        <FaLeaf className="text-6xl" />
      </div>
      <div className="absolute bottom-10 right-10 text-emerald-400 opacity-20">
        <FaSeedling className="text-6xl" />
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center md:items-start px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        
        {/* Main Heading */}
        <div className="text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
            <span className="text-white text-sm font-medium">Premium Agricultural Supplies</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Grow Your <span className="text-yellow-300">Harvest</span> <br />
            With Quality <span className="text-green-300">Farming</span> Tools
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
            One-stop solution for all your agricultural needs. Premium fertilizers, 
            pesticides, seeds, and equipment for modern farming.
          </p>
        </div>

        {/* Buttons & Features */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6">
          <Link
            to="/products"
            className="group flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <span>Shop Now</span>
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <Link
            to="/categories"
            className="group flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <FaShoppingCart />
            <span>Browse Categories</span>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-10 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-white/80">Happy Farmers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">100+</div>
            <div className="text-sm text-white/80">Products</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hidden md:block">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">22+</div>
            <div className="text-sm text-white/80">Brands</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hidden md:block">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">5+</div>
            <div className="text-sm text-white/80">Years</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainBanner;