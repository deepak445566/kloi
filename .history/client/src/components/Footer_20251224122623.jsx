import React from 'react'
import { footerLinks } from '../assets/assets'

function Footer() {
  // Social media data with icons (using Font Awesome classes)
  const socialMedia = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/kuntalagroexpert?igsh=b2MyMjRoMnVoa2Q=",
      icon: "fab fa-instagram",
      color: "hover:bg-pink-500 hover:text-white"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1Bixr7msU4/",
      icon: "fab fa-facebook-f",
      color: "hover:bg-blue-600 hover:text-white"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@kuntalagroexperts?si=Q0dwg80979FnKLTj",
      icon: "fab fa-youtube",
      color: "hover:bg-red-600 hover:text-white"
    }
  ]

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <img className="w-34 md:w-22" src="/logo1.png" alt="dummyLogoColored" />
          <p className="max-w-[410px] mt-6">
            We deliver quality agriculture products and farm essentials straight to your fields. 
            Trusted by thousands of farmers, we aim to make your farming journey productive and profitable.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>
              
              {/* Check if this is the "Follow Us" section */}
              {section.title === "Follow Us" ? (
                <div className="flex gap-4 mt-2">
                  {socialMedia.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center 
                                text-gray-600 transition-all duration-300 ${social.color}
                                border border-gray-300 hover:border-transparent`}
                      aria-label={`Follow us on ${social.name}`}
                      title={social.name}
                    >
                      <i className={social.icon}></i>
                    </a>
                  ))}
                </div>
              ) : (
                // Render regular links for other sections
                <ul className="text-sm space-y-1">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href={link.url} className="hover:underline transition">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className='flex flex-col md:flex-row justify-between items-center py-4'>
        <p className="text-center text-sm md:text-base text-gray-500/80 mb-4 md:mb-0">
          Copyright 2025 ©{" "}
          <a href="#" className="hover:text-gray-700">
            KuntalAgroAgenc
          </a>{" "}
          All Right Reserved.
        </p>
        
        <p className="text-center text-sm md:text-base text-gray-500/80">
          Design and Developed By{" "}
          <a 
            href="https://www.digitalexpressindia.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-700 underline"
          >
            DigitalExpressIndia
          </a>
        </p>
      </div>
    </div>
  )
}

export default Footer