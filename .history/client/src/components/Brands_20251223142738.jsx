import React from 'react';


const Brands = () => {
    const brandFiles = [
       "pi.jpg"
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