// TermsAndConditions.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Scale, 
  Shield, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sprout,
  Truck,
  Package,
  Users
} from 'lucide-react';

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction & Acceptance',
      icon: <FileText className="w-5 h-5" />,
      content: `Kuntal Agro Expert ("we," "our," or "us") is a registered micro-enterprise and agricultural supplies dealer serving farmers in Sohna, Gurugram and surrounding areas since October 2018. We operate under Udyam registration as Kuntal Agro Agencies, specializing in complete farm solutions.

These Terms and Conditions govern your use of our agricultural products platform. By accessing or using our services, you agree to be bound by these terms. If you disagree with any part, please discontinue use immediately.

Our mission is to make your farming journey productive and profitable by delivering quality agricultural products straight to your fields.`
    },
    {
      id: 'definitions',
      title: 'Key Definitions',
      icon: <Scale className="w-5 h-5" />,
      content: `• "User" refers to farmers, agricultural professionals, or any individual/entity using Kuntal Agro services.
• "Products" include crop seeds, fertilizers, pesticides, farm machinery, sprayers, sprayer parts, household insecticides, terrace gardening supplies, plantation materials, and other agricultural inputs.
• "Services" encompass product listings, purchasing, delivery, crop care guidance, and related agricultural support.
• "Platform" means the Kuntal Agro website, mobile application, and physical store near Sohna Sabzi Mandi.
• "Kuntal Agro Expert" refers to our service identity providing agricultural expertise and guidance.`
    },
    {
      id: 'account',
      title: 'User Accounts & Responsibilities',
      icon: <Shield className="w-5 h-5" />,
      content: `1. You must be at least 18 years old to create an account or make purchases.
2. Provide accurate agricultural business information to ensure we can offer the right guidance for your seasonal crops.
3. Maintain confidentiality of login credentials.
4. Notify us immediately of unauthorized account access.
5. You are responsible for all activities under your account.
6. We reserve the right to refuse service to anyone violating agricultural regulations.`
    },
    {
      id: 'product',
      title: 'Agricultural Products Information',
      icon: <Sprout className="w-5 h-5" />,
      content: `• We partner with trusted industry brands to provide genuine, high-quality products.
• Product descriptions are provided by suppliers; verify suitability for your specific crops and soil conditions.
• Follow manufacturer instructions carefully for pesticides and fertilizers - we provide dosage and timing guidance but ultimate responsibility lies with the user.
• Weather, soil conditions, and application methods significantly affect agricultural results.
• We are not liable for crop outcomes or yield variations despite providing quality products and guidance.
• Contact our experts directly for technical product support and seasonal crop advice.`
    },
    {
      id: 'ordering',
      title: 'Ordering & Payment',
      icon: <CheckCircle className="w-5 h-5" />,
      content: `1. Prices are in Indian Rupees (INR) and subject to change without notice.
2. Orders are confirmed only after payment verification.
3. We accept UPI, net banking, cards, and agricultural credit options.
4. Bulk orders for large farms may require special arrangements - contact us directly.
5. Contact support within 24 hours for order modifications.
6. We maintain fair pricing and do not push unnecessary items.`
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <Truck className="w-5 h-5" />,
      content: `• We deliver quality agriculture products straight to your fields in Sohna, Gurugram, and surrounding areas.
• Delivery times vary based on crop seasons, location, and rural accessibility.
• Rural delivery may take 5-10 business days depending on your village location.
• Perishable items like seeds require special handling - follow our storage instructions.
• Inspect deliveries immediately and report damages within 48 hours.
• Seasonal demand during planting periods may affect delivery schedules.
• Free local delivery may be available for orders above a certain value.`
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      icon: <Package className="w-5 h-5" />,
      content: `Accepted within 7 days for:
• Damaged or defective products
• Incorrect items shipped
• Unopened pesticides/fertilizers (with safety seals intact)
• Non-perishable items in original packaging

Not accepted for:
• Perishable seeds beyond germination period
• Opened chemical products
• Custom-ordered farm machinery or equipment
• Seasonal clearance items
• Products that have been used or partially consumed

Refunds processed within 10-14 business days to original payment method.`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: `Kuntal Agro Agencies is not liable for:
• Crop losses, yield variations, or agricultural outcomes
• Incorrect product application despite our guidance
• Weather-related damages, natural disasters, or climate effects
• Supplier-manufactured product defects (warranty claims go to manufacturer)
• Transportation delays beyond our control
• Personal injury from improper use of agricultural chemicals

Maximum liability limited to the value of your order. We are a micro-enterprise serving local farmers with best efforts and expertise.`
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      content: `• Kuntal Agro Expert branding, "For People Who Love Farming" tagline, website content, and platform are protected intellectual property.
• Agricultural data and farm information you share remains your property.
• You grant us limited license to use anonymized, aggregated data for service improvement and understanding regional farming patterns.
• Do not reproduce platform content, product descriptions, or agricultural guidance without written permission.
• Our website design and development by DigitalExpressIndia is protected.`
    },
    {
      id: 'testimonials',
      title: 'Customer Testimonials & Reviews',
      icon: <Users className="w-5 h-5" />,
      content: `• By submitting testimonials, you grant Kuntal Agro permission to use them for marketing with your first name and initial.
• We may edit testimonials for clarity and length while preserving original meaning.
• You can request removal of your testimonial by contacting us.
• We display genuine customer experiences to help other farmers make informed decisions.
• Fake or misleading reviews will be removed, and accounts may be suspended.`
    },
    {
      id: 'termination',
      title: 'Termination',
      content: `We may suspend or terminate accounts for:
• Violation of these terms or agricultural regulations
• Fraudulent activities or false information
• Unauthorized reselling of our products
• Harmful platform use or harassment of staff
• Non-payment of dues or repeated order cancellations
• Misuse of farmer discounts or benefits

Terminated accounts lose access to order history and future services.`
    },
    {
      id: 'governing',
      title: 'Governing Law & Dispute Resolution',
      content: `These terms are governed by Indian law, specifically the laws of the State of Haryana. 

Disputes will be resolved in courts in Gurugram, Haryana, India. 

Agricultural-specific disputes may first be referred to the Haryana State Agriculture Department or local Krishi Vigyan Kendra for mediation.

We encourage direct communication to resolve any issues before legal proceedings.`
    },
    {
      id: 'updates',
      title: 'Updates to Terms',
      content: `We may update these terms periodically to reflect changes in our services, agricultural regulations, or business practices. 

Continued use after changes constitutes acceptance. 

Major changes affecting user rights will be notified via email, platform announcement, or SMS to registered users.

Last updated: ${new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Kuntal Agro Expert</h1>
              <p className="text-green-700 font-medium">For People Who Love Farming</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Terms & Conditions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agricultural Products Platform - Governing your use of our services
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Udyam Registered Micro-Enterprise
            </div>
            <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              Serving Sohna & Gurugram Since 2018
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Trusted by 500+ Farmers
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-amber-800 font-medium">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Important: These terms affect your legal rights. Please read carefully before using our agricultural services.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* TOC */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Table of Contents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center gap-3 p-3 text-left hover:bg-green-100 rounded-lg transition-colors ${
                    activeSection === section.id ? 'bg-green-100 border border-green-200' : ''
                  }`}
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-700">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Terms Sections */}
          <div className="divide-y divide-gray-100">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className={`p-6 transition-colors ${
                  activeSection === section.id ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-green-600">
                      {section.icon || <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Click to {activeSection === section.id ? 'collapse' : 'expand'} section
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {activeSection === section.id ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </button>
                
                {activeSection === section.id && (
                  <div className="mt-6 pl-14 animate-fadeIn">
                    <div className="prose prose-green max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                      {section.id === 'product' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> We stock top brands and offer organic options. 
                            Our experts provide guidance based on years of experience serving local farmers.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Agreement Acceptance
              </h3>
              <p className="text-gray-600">
                By using Kuntal Agro Expert's agricultural platform and services, you acknowledge 
                reading and understanding these terms and agree to be bound by them as a 
                registered micro-enterprise serving the farming community.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                id="accept-terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="accept-terms" className="text-gray-700 flex-1">
                <span className="font-bold block mb-1">
                  I have read, understood, and agree to the Terms & Conditions
                </span>
                <span className="text-sm">
                  I acknowledge these terms govern my use of Kuntal Agro Expert's agricultural 
                  products and services, including ordering, delivery, returns, and the 
                  limitation of liability as a local agricultural supplier.
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  if (accepted) {
                    alert('Thank you for accepting our Terms & Conditions! Welcome to Kuntal Agro Expert - For People Who Love Farming.');
                    // In a real app, you would navigate to next step or save acceptance
                  }
                }}
                disabled={!accepted}
                className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  accepted
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {accepted ? 'Accept & Continue to Services' : 'Please Accept Terms to Continue'}
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Print Terms
              </button>
              
              <button
                onClick={() => window.location.href = 'mailto:info@kuntalagro.com?subject=Terms%20and%20Conditions%20Query'}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Contact Legal/Support
              </button>
              
              <button
                onClick={() => window.location.href = 'https://kuntalagro.com'}
                className="px-6 py-3 border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Visit Our Website
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="mb-2 font-medium text-gray-700">
              For agricultural emergency contacts, pesticide poisoning help, or immediate crop advice:
            </p>
            <p className="mb-2">
              Call: <span className="font-bold text-green-700">1800-XXX-XXXX</span> (24/7 Agricultural Helpline)
            </p>
            <p className="text-xs">
              Local Sohna/Gurugram farmers can visit our store near Sohna Sabzi Mandi for in-person guidance.
            </p>
          </div>
          
          <p className="text-gray-600">
            <strong>Kuntal Agro Agencies</strong> • Udyam Registered Micro-Enterprise • 
            Serving Since October 2018
          </p>
          <p className="text-gray-500">
            info@kuntalagro.com • Store: Near Sohna Sabzi Mandi, Sohna, Gurugram, Haryana
          </p>
          <p className="text-gray-400 pt-2 border-t border-gray-200">
            © {new Date().getFullYear()} Kuntal Agro Agencies. All Rights Reserved.
            <br />
            Design and Developed By DigitalExpressIndia
          </p>
        </div>
      </div>

      {/* Add some custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TermsAndConditions;