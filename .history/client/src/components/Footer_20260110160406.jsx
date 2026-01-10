import React from 'react'
import { footerLinks } from '../assets/assets'
import { FaInstagram, FaFacebookF, FaYoutube, FaPhone, FaMapMarkerAlt, FaEnvelope, FaLeaf, FaShieldAlt, FaTruck, FaHeadset } from 'react-icons/fa'

function Footer() {
  const socialMedia = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/kuntalagroexpert?igsh=b2MyMjRoMnVoa2Q=",
      icon: <FaInstagram className="text-lg" />,
      color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1Bixr7msU4/",
      icon: <FaFacebookF className="text-lg" />,
      color: "hover:bg-blue-600"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@kuntalagroexperts?si=Q0dwg80979FnKLTj",
      icon: <FaYoutube className="text-lg" />,
      color: "hover:bg-red-600"
    }
  ]

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: "Call Us",
      details: ["+91 XXXXX XXXXX", "+91 XXXXX XXXXX"],
      color: "text-green-600"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Us",
      details: ["Shop No. 123", "Sohna, Gurugram", "Haryana - 122103"],
      color: "text-blue-600"
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      details: ["kuntalagro@gmail.com", "support@kuntalagro.com"],
      color: "text-red-600"
    }
  ]

  const trustFeatures = [
    {
      icon: <FaShieldAlt />,
      title: "Genuine Products",
      desc: "100% authentic & certified"
    },
    {
      icon: <FaTruck />,
      title: "Fast Delivery",
      desc: "Across Sohna & Gurugram"
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Support",
      desc: "Farmer assistance"
    },
    {
      icon: <FaLeaf />,
      title: "Organic Options",
      desc: "Eco-friendly products"
    }
  ]

  // Reorganize footer links if needed
  const organizedLinks = footerLinks || [
    {
      title: "Products",
      links: [
        { text: "Fertilizers", url: "/products/fertilizers" },
        { text: "Pesticides", url: "/products/pesticides" },
        { text: "Seeds", url: "/products/seeds" },
        { text: "Equipment", url: "/products/equipment" }
      ]
    },
    {
      title: "Company",
      links: [
        { text: "About Us", url: "/about" },
        { text: "Our Story", url: "/our-story" },
        { text: "Testimonials", url: "/reviews" },
        { text: "Contact", url: "/contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { text: "FAQ", url: "/faq" },
        { text: "Shipping", url: "/shipping" },
        { text: "Returns", url: "/returns" },
        { text: "Privacy Policy", url: "/privacy" }
      ]
    }
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 border-b border-gray-800">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                <FaLeaf className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Kuntal Agro Expert</h2>
                <p className="text-green-400 font-medium">Trusted Since 2018</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Your one-stop solution for premium agricultural products. 
              Serving farmers in Sohna & Gurugram with genuine farming supplies and expert guidance.
            </p>
            
            {/* Social Media */}
            <div className="pt-4">
              <h3 className="font-semibold text-white mb-4 text-lg">Follow Our Journey</h3>
              <div className="flex space-x-4">
                {socialMedia.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center 
                              text-gray-300 hover:text-white transition-all duration-300 ${social.color}
                              shadow-lg hover:shadow-xl hover:-translate-y-1 transform`}
                    aria-label={`Follow on ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">Get In Touch</h3>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`bg-gray-800 p-3 rounded-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-300 text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">Farming Insights</h3>
            <p className="text-gray-300">
              Subscribe to receive farming tips, seasonal offers, and agricultural insights.
            </p>
            <form className="space-y-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         placeholder-gray-400 text-white"
                required
              />
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white 
                         font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/20 
                         transition-all duration-300"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
        
        {/* Middle Section: Links & Features */}
        <div className="py-12">
          {/* Trust Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {trustFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center 
                         border border-gray-700 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="text-green-400 text-2xl mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {organizedLinks.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-bold text-white text-lg mb-4 border-l-4 border-green-500 pl-3">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.url}
                        className="text-gray-300 hover:text-green-400 hover:translate-x-2 
                                 transition-all duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-[2px] bg-green-500 
                                     mr-0 group-hover:mr-3 transition-all duration-300"></span>
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Kuntal Agro Agencies. All Rights Reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Udyam Registered • GSTIN: XXXXXXXXXXXXXX
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">
                Shipping Policy
              </a>
              <a href="/returns" className="text-gray-400 hover:text-white transition-colors text-sm">
                Return Policy
              </a>
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Designed & Developed by{' '}
              <a 
                href="https://www.digitalexpressindia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                DigitalExpressIndia
              </a>
            </p>
          </div>
          
          {/* Payment Methods (Optional) */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <div className="text-gray-500 text-sm">Secure Payments:</div>
            <div className="flex gap-2">
              <div className="bg-gray-800 px-3 py-1 rounded text-sm">UPI</div>
              <div className="bg-gray-800 px-3 py-1 rounded text-sm">Cash</div>
              <div className="bg-gray-800 px-3 py-1 rounded text-sm">Card</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-emerald-700 
                 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 
                 transition-all duration-300 z-50"
        aria-label="Back to top"
      >
        <FaLeaf className="text-xl" />
      </button>
    </footer>
  )
}

export default Footer