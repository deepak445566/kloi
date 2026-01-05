import React, { useState } from 'react';

const Brands = () => {
    const brandFiles = [
        "pi1.png", "pi2.jpg", "pi3.jpg", "pi4.png", "pi5.png",
        "pi6.png", "pi7.png", "pi8.png", "pi9.jpg", "pi10.png",
        "pi11.jpg", "pi12.png", "pi13.jpg", "pi14.png", "pi15.png",
        "pi16.png", "pi17.jpg", "pi18.jpg", "pi19.png", "pi20.jpg",
        "pi21.png", "pi22.png"
    ];

    // Array warna untuk placeholder jika gambar gagal dimuat
    const placeholderColors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
        '#EF476F', '#073B4C', '#7209B7', '#F72585', '#3A86FF',
        '#FB5607', '#8338EC', '#3A86FF', '#FF006E', '#FFBE0B',
        '#FB5607', '#8338EC', '#3A86FF', '#FF006E', '#FFBE0B',
        '#FB5607', '#8338EC'
    ];

    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (index) => {
        setImageErrors(prev => ({ ...prev, [index]: true }));
    };

    return (
        <div className="relative overflow-hidden py-12 bg-gray-50">
            {/* Section Title */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Trusted Brands</h2>
                <p className="text-gray-600">Partnering with the best in the industry</p>
            </div>
            
            {/* Left Gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
            
            {/* Brands Marquee */}
            <div className="relative">
                <div className="marquee-track flex">
                    {[...brandFiles, ...brandFiles].map((file, index) => {
                        const originalIndex = index % brandFiles.length;
                        const hasError = imageErrors[index];
                        
                        return (
                            <div 
                                key={index} 
                                className="brand-logo flex-shrink-0 mx-8 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            >
                                {hasError ? (
                                    <div 
                                        className="brand-placeholder h-16 w-32 flex items-center justify-center rounded-lg transition-all duration-300"
                                        style={{ 
                                            backgroundColor: placeholderColors[originalIndex],
                                            filter: 'grayscale(100%)'
                                        }}
                                    >
                                        <span className="text-white font-semibold text-sm opacity-80">
                                            Brand {originalIndex + 1}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img 
                                            src={file}
                                            alt={`Brand ${originalIndex + 1}`}
                                            className="brand-image h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                                            draggable={false}
                                            loading="lazy"
                                            onError={() => handleImageError(index)}
                                            style={{
                                                backgroundColor: placeholderColors[originalIndex] + '20' // 20 = 12% opacity
                                            }}
                                        />
                                        {/* Loading state */}
                                        <div 
                                            className="absolute inset-0 bg-gray-200 animate-pulse rounded"
                                            style={{ zIndex: -1 }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Right Gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
            
            {/* CSS for marquee animation */}
            <style jsx>{`
                .marquee-track {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                .marquee-track:hover {
                    animation-play-state: paused;
                }
                
                .brand-logo {
                    min-width: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 20px;
                }

                .brand-placeholder {
                    min-width: 150px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                .brand-placeholder:hover {
                    filter: grayscale(0%) !important;
                    transform: scale(1.1);
                }
                
                @media (max-width: 768px) {
                    .brand-logo {
                        min-width: 120px;
                    }
                    .brand-image {
                        height: 40px;
                    }
                    .brand-placeholder {
                        min-width: 120px;
                        height: 40px;
                    }
                    .marquee-track {
                        animation-duration: 20s;
                    }
                }
            `}</style>
        </div>
    );
};

export default Brands;