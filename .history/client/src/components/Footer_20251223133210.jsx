import React from 'react'
import { assets, footerLinks } from '../assets/assets'

function Footer() {
  const socialMediaIcons = [
    { name: 'facebook', icon: 'fab fa-facebook-f', url: '#' },
    { name: 'twitter', icon: 'fab fa-twitter', url: '#' },
    { name: 'instagram', icon: 'fab fa-instagram', url: '#' },
    { name: 'linkedin', icon: 'fab fa-linkedin-in', url: '#' },
    { name: 'youtube', icon: 'fab fa-youtube', url: '#' }
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 shadow-inner mt-24">
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-300 text-gray-600">
          <div className="flex-1">
            <img 
              className="w-32 md:w-36" 
              src="/logo1.png" 
              alt="Kuntal Agro Agency Logo" 
            />
            <p className="max-w-[410px] mt-6 leading-relaxed text-gray-700">
              We deliver quality agriculture products and farm essentials straight to your fields. 
              Trusted by thousands of farmers, we aim to make your farming journey productive and profitable.
            </p>
            
            {/* Social Media Icons */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
              <div className="flex gap-3">
                {socialMediaIcons.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center 
                             text-gray-600 hover:bg-green-50 hover:text-green-600 hover:shadow-lg 
                             transition-all duration-300 border border-gray-200"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between w-full md:w-[55%] gap-8">
            {footerLinks.map((section, index) => (
              <div key={index} className="min-w-[150px]">
                <h3 className="font-bold text-lg text-gray-900 mb-5 pb-2 border-b border-green-100">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.url} 
                        className="text-gray-600 hover:text-green-600 hover:pl-2 transition-all duration-300 flex items-center"
                      >
                        <span className="mr-2">→</span>
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-sm text-gray-600">
            Copyright © 2025{" "}
            <a 
              href="#" 
              className="font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              KuntalAgroAgency
            </a>{" "}
            All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-green-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-green-700 transition-colors"
            >
              Terms & Conditions
            </a>
          </div>
          
          <p className="text-sm text-gray-600">
            Developed by{" "}
            <a 
              href="https://www.digitalexpressindia.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              DigitalExpressIndia
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer