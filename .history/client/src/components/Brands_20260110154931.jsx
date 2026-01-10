import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar, FaAward } from 'react-icons/fa';

const Brands = () => {
    const brandFiles = [
        "pi1.png", "pi2.jpg", "pi3.jpg", "pi4.png", "pi5.png",
        "pi6.png", "pi7.png", "pi8.png", "pi9.jpg", "pi10.png",
        "pi11.jpg", "pi12.png", "pi13.jpg", "pi14.png", "pi15.png",
        "pi16.png", "pi17.jpg", "pi18.jpg", "pi19.png", "pi20.jpg",
        "pi21.png", "pi22.png"
    ];

    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-slide for mobile
    useEffect(() => {
        if (!isMobile) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => 
                prev === brandFiles.length - 1 ? 0 : prev + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [isMobile, brandFiles.length]);

    const visibleBrands = isMobile 
        ? [brandFiles[currentIndex]]
        : brandFiles;

    return (
        <div className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-b from-white to-green-50">
            
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-8 md:mb-12">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Trusted <span className="text-green-700">Agricultural Brands</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
                        We partner with leading brands to provide you with premium quality products
                    </p>
                    
                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                            <FaStar className="text-yellow-500 mr-2" />
                            <span className="text-sm font-medium text-gray-800">Premium Quality</span>
                        </div>
                        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                            <FaAward className="text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-800">Genuine Brands</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Brands Container */}
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg mx-4 md:mx-8 lg:mx-16 p-6 md:p-8">
                
                {/* Desktop Marquee */}
                {!isMobile && (
                    <>
                        <div 
                            className="relative overflow-x-hidden"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className={`flex ${isHovered ? 'pause-animation' : ''}`}>
                                <div className="marquee-content flex">
                                    {[...brandFiles, ...brandFiles].map((file, index) => (
                                        <div 
                                            key={index} 
                                            className="brand-card flex-shrink-0 mx-3 md:mx-6 transition-all duration-300 transform hover:scale-110"
                                        >
                                            <div className="bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                                                <div className="relative">
                                                    <img 
                                                        src={file}
                                                        alt={`Brand ${(index % brandFiles.length) + 1}`}
                                                        className="brand-image h-20 md:h-28 w-auto object-contain mx-auto transition-all duration-300 opacity-90 hover:opacity-100 hover:grayscale-0 grayscale-20"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Gradient Overlays */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                    </>
                )}

                {/* Mobile Slider */}
                {isMobile && (
                    <div className="relative">
                        <div className="flex justify-center items-center">
                            <div className="brand-card">
                                <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl shadow-lg border border-gray-200">
                                    <img 
                                        src={visibleBrands[0]}
                                        alt={`Brand ${currentIndex + 1}`}
                                        className="h-32 w-auto object-contain mx-auto"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Mobile Navigation Dots */}
                        <div className="flex justify-center mt-6 space-x-2">
                            {brandFiles.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === currentIndex 
                                            ? 'bg-green-600 w-8' 
                                            : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Mobile Navigation Arrows */}
                        <button
                            onClick={() => setCurrentIndex(prev => prev === 0 ? brandFiles.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
                        >
                            <FaChevronLeft className="text-gray-700" />
                        </button>
                        <button
                            onClick={() => setCurrentIndex(prev => prev === brandFiles.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
                        >
                            <FaChevronRight className="text-gray-700" />
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="mt-8 md:mt-12 max-w-4xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">
                            {brandFiles.length}+
                        </div>
                        <div className="text-sm md:text-base text-gray-600">
                            Premium Brands
                        </div>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">
                            100%
                        </div>
                        <div className="text-sm md:text-base text-gray-600">
                            Genuine Products
                        </div>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">
                            24/7
                        </div>
                        <div className="text-sm md:text-base text-gray-600">
                            Support
                        </div>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-2xl md:text-3xl font-bold text-green-700 mb-1">
                            ✓
                        </div>
                        <div className="text-sm md:text-base text-gray-600">
                            Quality Assured
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Styles */}
            <style jsx>{`
                .marquee-content {
                    display: flex;
                    animation: marquee 40s linear infinite;
                    width: max-content;
                }

                .pause-animation .marquee-content {
                    animation-play-state: paused;
                }

                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .brand-card {
                    min-width: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 768px) {
                    .brand-card {
                        min-width: 120px;
                    }
                }

                .brand-image {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .brand-card:hover .brand-image {
                    transform: scale(1.1);
                }

                .grayscale-20 {
                    filter: grayscale(20%);
                }

                /* Touch optimization */
                @media (hover: none) and (pointer: coarse) {
                    .brand-card:hover .brand-image {
                        transform: none;
                    }
                    
                    .pause-animation .marquee-content {
                        animation-play-state: running;
                    }
                }
            `}</style>
        </div>
    );
};

export default Brands;