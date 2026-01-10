import React from 'react'
import { footerLinks } from '../assets/assets'
import { FaInstagram, FaFacebookF, FaYoutube, FaPhone, FaMapMarkerAlt, FaEnvelope, FaLeaf } from 'react-icons/fa'

function Footer() {
  // Social media data with React Icons
  const socialMedia = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/kuntalagroexpert?igsh=b2MyMjRoMnVoa2Q=",
      icon: <FaInstagram />,
      color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1Bixr7msU4/",
      icon: <FaFacebookF />,
      color: "hover:bg-blue-600"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@kuntalagroexperts?si=Q0dwg80979FnKLTj",
      icon: <FaYoutube />,
      color: "hover:bg-red-600"
    }
  ]

  const contactInfo = [
    {
      icon: <FaPhone className="text-green-600" />,
      text: "+91 XXXXX XXXXX",
      subtext: "Call for enquiry"
    },
    {
      icon: <FaMapMarkerAlt className="text-green-600" />,
      text: "Sohna, Gurugram",
      subtext: "Haryana, India"
    },
    {
      icon: <FaEnvelope className="text-green-600" />,
      text: "kuntalagro@gmail.com",
      subtext: "Email us"
    }
  ]

  return (
    <footer className="bg-gradient-to-b from-white to-green-50 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12 border-b border-gray-200">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <FaLeaf className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Kuntal Agro Expert</h2>
                <p className="text-green-700 font-medium">Your Trusted Farming Partner</p>
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed max-w-xl">
              We deliver premium quality agriculture products and farm essentials straight to your fields. 
              Trusted by thousands of farmers, we aim to make your farming journey productive and profitable.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.text}</p>
                    <p className="text-sm text-gray-500">{item.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Social Media */}
            <div className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-3">
                {socialMedia.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center 
                              text-gray-600 hover:text-white transition-all duration-300 ${social.color}
                              shadow-sm hover:shadow-lg hover:-translate-y-1`}
                    aria-label={`Follow us on ${social.name}`}
                    title={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {section.title}
                </h3>
                
                {section.title !== "Follow Us" && (
                  <ul className="space-y-3">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <a 
                          href={link.url}
                          className="text-gray-600 hover:text-green-700 hover:translate-x-1 transition-all duration-300 flex items-center group"
                        >
                          <span className="w-0 group-hover:w-2 h-[2px] bg-green-600 mr-0 group-hover:mr-2 transition-all"></span>
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
        
        {/* Bottom Section */}
        <div className="pt-8">
          {/* Newsletter Subscription */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Stay Updated with Farming Tips</h3>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Kuntal Agro Agencies. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Udyam Registered Enterprise • GST Registered
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                Designed & Developed by{' '}
                <a 
                  href="https://www.digitalexpressindia.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 font-semibold hover:text-green-800 hover:underline transition-colors"
                >
                  DigitalExpressIndia
                </a>
              </p>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">100% Genuine Products</span>
            </div>
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
            <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Farmer Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer