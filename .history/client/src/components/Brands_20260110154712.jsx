import React, { useState, useEffect } from 'react';
import { FaStar, FaAward, FaShieldAlt, FaTrophy } from 'react-icons/fa';

const Brands = () => {
    const brandFiles = [
        "pi1.png", "pi2.jpg", "pi3.jpg", "pi4.png", "pi5.png",
        "pi6.png", "pi7.png", "pi8.png", "pi9.jpg", "pi10.png",
        "pi11.jpg", "pi12.png", "pi13.jpg", "pi14.png", "pi15.png",
        "pi16.png", "pi17.jpg", "pi18.jpg", "pi19.png", "pi20.jpg",
        "pi21.png", "pi22.png"
    ];

    const [isMobile, setIsMobile] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const trustedFeatures = [
        {
            icon: <FaStar className="text-xl" />,
            title: "Premium Brands",
            description: "Top quality agricultural products"
        },
        {
            icon: <FaAward className="text-xl" />,
            title: "Certified Products",
            description: "Genuine & certified brands"
        },
        {
            icon: <FaShieldAlt className="text-xl" />,
            title: "Quality Assured",
            description: "100% authentic products"
        },
        {
            icon: <FaTrophy className="text-xl" />,
            title: "Market Leaders",
            description: "Industry-leading brands"
        }
    ];

    // Group brands into chunks for mobile display
    const chunkBrands = (brands, size) => {
        const chunks = [];
        for (let i = 0; i < brands.length; i += size) {
            chunks.push(brands.slice(i, i + size));
        }
        return chunks;
    };

    const brandChunks = isMobile ? chunkBrands(brandFiles, 3) : chunkBrands(brandFiles, 4);

    return (
        <div className="relative py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
                        <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
                            Trusted Brands
                        </span>
                        <div className="w-8 h-0.5 bg-green-300 mx-2"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        We Work With <span className="text-green-700">Premium Brands</span>
                    </h2>
                    
                    <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full mx-auto mb-6"></div>
                    
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
                        Partnering with industry leaders to bring you the best agricultural products
                    </p>
                    
                    {/* Trust Features - Desktop Only */}
                    <div className="hidden md:grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {trustedFeatures.map((feature, index) => (
                            <div 
                                key={index}
                                className="flex flex-col items-center text-center p-4"
                            >
                                <div className="bg-green-100 p-3 rounded-full mb-3">
                                    <div className="text-green-600">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Brands Section */}
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg p-6 md:p-8 mb-12">
                    
                    {/* Desktop Marquee */}
                    {!isMobile && (
                        <>
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                            
                            <div className="relative overflow-hidden">
                                <div className="flex animate-marquee whitespace-nowrap">
                                    {[...brandFiles, ...brandFiles].map((file, index) => (
                                        <div 
                                            key={index}
                                            className="inline-flex mx-4 md:mx-6 transition-all duration-300 hover:scale-110"
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                            <div className="p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-white border border-gray-100">
                                                <img 
                                                    src={file}
                                                    alt={`Brand ${(index % brandFiles.length) + 1}`}
                                                    className="h-20 w-auto object-contain transition-all duration-300 opacity-80 hover:opacity-100"
                                                    loading="lazy"
                                                    style={{
                                                        filter: hoveredIndex === index ? 'none' : 'grayscale(20%)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Mobile Grid */}
                    {isMobile && (
                        <div className="grid grid-cols-3 gap-4">
                            {brandFiles.map((file, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-center p-3 bg-gray-50 rounded-lg shadow-sm active:scale-95 transition-transform"
                                >
                                    <img 
                                        src={file}
                                        alt={`Brand ${index + 1}`}
                                        className="h-16 w-auto object-contain opacity-80"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trust Badge - Mobile */}
                    {isMobile && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-green-600 font-bold text-lg">22+</div>
                                    <div className="text-gray-600 text-sm">Premium Brands</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-green-600 font-bold text-lg">100%</div>
                                    <div className="text-gray-600 text-sm">Genuine Products</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 md:p-10 text-white shadow-xl">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Looking for Specific Brands?
                        </h3>
                        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                            We stock all major agricultural brands. Contact us for specific product inquiries.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-green-700 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                                View All Brands
                            </button>
                            <button className="bg-green-800 text-white font-bold px-6 py-3 rounded-full hover:bg-green-900 transition-all duration-300 transform hover:scale-105">
                                Contact for Availability
                            </button>
                        </div>
                    </div>
                </div>

                {/* Additional Info - Desktop */}
                {!isMobile && (
                    <div className="mt-12 grid grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-700 mb-2">22+</div>
                            <div className="text-gray-700 font-semibold">Premium Brands</div>
                            <div className="text-sm text-gray-500 mt-1">Industry leaders in agriculture</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-700 mb-2">100%</div>
                            <div className="text-gray-700 font-semibold">Genuine Products</div>
                            <div className="text-sm text-gray-500 mt-1">Authentic & certified</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-700 mb-2">24/7</div>
                            <div className="text-gray-700 font-semibold">Support Available</div>
                            <div className="text-sm text-gray-500 mt-1">Product guidance & assistance</div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                    animation-play-state: running;
                }
                
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                
                @media (max-width: 768px) {
                    .grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
                
                /* Touch device optimization */
                @media (hover: none) and (pointer: coarse) {
                    .animate-marquee:hover {
                        animation-play-state: running;
                    }
                }
                
                /* Smooth image loading */
                .brand-image {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default Brands;