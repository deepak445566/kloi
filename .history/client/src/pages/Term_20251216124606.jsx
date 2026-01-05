// TermsAndConditions.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Scale, 
  Shield, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
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
      content: `Welcome to Bachta Ha ("we," "our," or "us"). These Terms and Conditions govern your use of our agricultural products platform. By accessing or using our services, you agree to be bound by these terms. If you disagree with any part, please discontinue use immediately.`
    },
    {
      id: 'definitions',
      title: 'Key Definitions',
      icon: <Scale className="w-5 h-5" />,
      content: `• "User" refers to any individual or entity using Bachta Ha services.
      • "Products" include seeds, fertilizers, pesticides, equipment, and other agricultural inputs.
      • "Services" encompass product listings, purchasing, delivery, and related support.
      • "Platform" means the Bachta Ha website and mobile application.`
    },
    {
      id: 'account',
      title: 'User Accounts & Responsibilities',
      icon: <Shield className="w-5 h-5" />,
      content: `1. You must be at least 18 years old to create an account.
      2. Provide accurate agricultural business information.
      3. Maintain confidentiality of login credentials.
      4. Notify us immediately of unauthorized account access.
      5. You are responsible for all activities under your account.`
    },
    {
      id: 'product',
      title: 'Agricultural Products Information',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `• Product descriptions are provided by suppliers; verify suitability for your specific crops and soil conditions.
      • Follow manufacturer instructions for pesticides and fertilizers.
      • Weather, soil conditions, and application methods affect results.
      • We are not liable for crop outcomes or yield variations.
      • Contact suppliers directly for technical product support.`
    },
    {
      id: 'ordering',
      title: 'Ordering & Payment',
      icon: <CheckCircle className="w-5 h-5" />,
      content: `1. Prices are in INR and subject to change without notice.
      2. Orders are confirmed only after payment verification.
      3. We accept UPI, net banking, cards, and agricultural credit options.
      4. Bulk orders may require special arrangements.
      5. Contact support within 24 hours for order modifications.`
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      content: `• Delivery times vary based on crop seasons and location.
      • Rural delivery may take 5-10 business days.
      • Perishable items require special handling instructions.
      • Inspect deliveries immediately and report damages within 48 hours.
      • Seasonal demand may affect delivery schedules.`
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      content: `Accepted within 7 days for:
      • Damaged or defective products
      • Incorrect items shipped
      • Unopened pesticides/fertilizers (with safety seals intact)
      
      Not accepted for:
      • Perishable seeds beyond germination period
      • Opened chemical products
      • Custom-ordered equipment
      • Seasonal clearance items`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: `Bachta Ha is not liable for:
      • Crop losses or agricultural outcomes
      • Incorrect product application
      • Weather-related damages
      • Supplier-manufactured product defects
      • Transportation delays beyond our control
      
      Maximum liability limited to order value.`
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      content: `• Bachta Ha branding, content, and platform are protected.
      • Agricultural data shared remains your property.
      • You grant us limited license to use anonymized data for service improvement.
      • Do not reproduce platform content without permission.`
    },
    {
      id: 'termination',
      title: 'Termination',
      content: `We may suspend or terminate accounts for:
      • Violation of these terms
      • Fraudulent activities
      • Unauthorized reselling
      • Harmful platform use
      • Non-payment of dues`
    },
    {
      id: 'governing',
      title: 'Governing Law',
      content: `These terms are governed by Indian law. Disputes will be resolved in courts in [Your State], India. Agricultural disputes may be referred to state agriculture departments.`
    },
    {
      id: 'updates',
      title: 'Updates to Terms',
      content: `We may update these terms periodically. Continued use after changes constitutes acceptance. Major changes will be notified via email or platform announcement. Last updated: ${new Date().toLocaleDateString()}.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Bachta Ha</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Terms & Conditions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agricultural Products Platform - Governing your use of our services
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-amber-800 font-medium">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Important: These terms affect your legal rights. Please read carefully.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* TOC */}
          <div className="p-6 bg-green-50 border-b">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Table of Contents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-3 p-3 text-left hover:bg-green-100 rounded-lg transition-colors"
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
              <div key={section.id} className="p-6 hover:bg-gray-50 transition-colors">
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
                        Click to {activeSection === section.id ? 'collapse' : 'expand'}
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
                  <div className="mt-6 pl-14">
                    <div className="prose prose-green max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
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
                By using Bachta Ha's agricultural platform, you acknowledge reading and 
                understanding these terms and agree to be bound by them.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="accept-terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="accept-terms" className="text-gray-700">
                <span className="font-bold block mb-1">
                  I have read, understood, and agree to the Terms & Conditions
                </span>
                <span className="text-sm">
                  I acknowledge these terms govern my use of Bachta Ha's agricultural 
                  products and services, including ordering, delivery, and returns.
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => accepted && alert('Terms accepted successfully!')}
                disabled={!accepted}
                className={`px-8 py-3 rounded-lg font-bold transition-all ${
                  accepted
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {accepted ? 'Accept & Continue' : 'Please Accept Terms'}
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Print Terms
              </button>
              
              <button
                onClick={() => window.location.href = 'mailto:legal@bachtaha.com'}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Contact Legal Team
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-2">
            For agricultural emergency contacts or pesticide poisoning help, 
            call: <span className="font-bold text-green-700">1800-XXX-XXXX</span>
          </p>
          <p>
            Bachta Ha Agricultural Services Pvt. Ltd. • support@bachtaha.com • 
            © {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;