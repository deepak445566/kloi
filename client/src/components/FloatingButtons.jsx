import React from 'react';

function FloatingButtons() {
  const phoneNumber = "918586845185";
  
  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  // Phone call click handler
  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col gap-3">
      
      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="relative group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        aria-label="Contact on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg 
          className="w-8 h-8 md:w-10 md:h-10" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
        </svg>
        
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </button>

      {/* Phone Floating Button */}
      <button
        onClick={handlePhoneClick}
        className="relative group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        aria-label="Call us"
      >
        {/* Phone Icon */}
        <svg 
          className="w-6 h-6 md:w-8 md:h-8" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Call: 91 85868 45185
        </span>
      </button>

      {/* Optional: Call to Action text */}
      <div className="hidden md:block absolute right-20 top-1/2 transform -translate-y-1/2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
        Contact Us
      </div>
    </div>
  );
}

export default FloatingButtons;