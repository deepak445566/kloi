import React from 'react';
import './index.css'; // या जहाँ CSS है

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
        <div className="brands-container">
            <div className="brands-gradient-left" />
            
            <div className="marquee-track">
                <div className="flex items-center gap-20 px-10 py-8">
                    {[...brandFiles, ...brandFiles].map((file, index) => (
                        <div key={index} className="brand-logo">
                            <img 
                                src={`/images/${file}`}
                                alt={`${file.replace('.png', '').replace('-', ' ')} logo`}
                                className="brand-image"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="brands-gradient-right" />
        </div>
    );
};

export default Brands;