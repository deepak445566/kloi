import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function MainBanner() {
  return (
    <div className="relative w-full">
      {/* Banner image */}
      <img
        src="/lo.png"
        alt="Main banner"
        className="w-full hidden md:block"
      />
      <img
        src="/mo.png"
        alt="Main banner mobile"
        className="w-full md:hidden"
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col justify-center md:items-start items-center px-6 md:px-16 mt-96 lg:mt-0 md:mt-0">
       

        {/* Buttons */}
        <div className="lg:mt-110 mt-30 lg:ml-70 mr-40 flex flex-col md:flex-row items-center  md:justify-start gap-4">
           <Link
            to="/products"
            className="group flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <span>Shop Now</span>
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>

        
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
