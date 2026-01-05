// Brands.jsx - पूरा कॉम्पोनेंट
import React from 'react';

const Brands = () => {
    const brandFiles = [
        "bayer.png", "upl.png", "sumitomo.png", "syngenta.png", 
        "fmc.png", "adama.png", "dhanuka.png", "basf.png", 
        "crystal.png", "godrej-agrovet.png", "swastik.png", 
        "geolife.png", "pci.png", "vnr.png", "mahyco.png", 
        "rasi.png", "falcon.png", "kisan-kraft.png", "stihl.png", 
        "multiplex.png", "pioneer.png", "iffco.png"
    ];

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none my-12">
            {/* Left gradient fade */}
            <div className="absolute left-0 top-0 h-full w-32 z-10 bg-gradient-to-r from-white via-white to-transparent" />
            
            {/* Marquee container */}
            <div 
                className="flex will-change-transform min-w-[200%]" 
                style={{
                    animation: 'marqueeScroll 25s linear infinite'
                }}
            >
                <div className="flex items-center gap-20 px-10 py-8">
                    {[...brandFiles, ...brandFiles].map((file, index) => (
                        <div key={index} className="min-w-[180px] h-20 flex items-center justify-center">
                            <img 
                                src={`/images/${file}`}
                                alt={`${file.replace('.png', '').replace('-', ' ')} logo`}
                                className="h-full w-auto object-contain max-h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Right gradient fade */}
            <div className="absolute right-0 top-0 h-full w-32 z-10 bg-gradient-to-l from-white via-white to-transparent" />
            
            {/* CSS in style tag */}
            <style>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default Brands;