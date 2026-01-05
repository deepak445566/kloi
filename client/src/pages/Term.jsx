// TermsAndConditions.jsx - Updated with exact location and contact details
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
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe
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
      content: `Kuntal Agro Agencies ("we," "our," or "us") is your trusted partner for quality agricultural products and solutions. We are a registered micro-enterprise and agricultural supplies dealer serving farmers in Sohna, Gurugram and surrounding areas since October 2018.

These Terms and Conditions govern your use of our agricultural products platform and services. By accessing or using our services, you agree to be bound by these terms. If you disagree with any part, please discontinue use immediately.

Our mission is to make your farming journey productive and profitable by delivering quality agricultural products straight to your fields.`
    },
    {
      id: 'definitions',
      title: 'Key Definitions',
      icon: <Scale className="w-5 h-5" />,
      content: `• "User" refers to farmers, agricultural professionals, or any individual/entity using Kuntal Agro services.
• "Products" include crop seeds, fertilizers, pesticides, farm machinery, sprayers, sprayer parts, household insecticides, terrace gardening supplies, plantation materials, and other agricultural inputs.
• "Services" encompass product listings, purchasing, delivery, crop care guidance, and related agricultural support.
• "Platform" means the Kuntal Agro website (kuntalagro.com), mobile application, and our physical store at Shop No.1, Ward No.19, near Civil Hospital, Sohna.
• "Business Hours" refer to our operational hours: Monday to Sunday, 8:00 AM to 8:00 PM.`
    },
    {
      id: 'contact-info',
      title: 'Contact & Location Information',
      icon: <MapPin className="w-5 h-5" />,
      content: `Primary Contact Details:

📍 PHYSICAL STORE:
Shop No.1, Ward No.19
Near Civil Hospital, Sohna Rural
Sohna, Haryana 122103
Landmark: 63X8+FR Sohna, Haryana
(GPS: Near Civil Hospital, Sohna)

📞 TELEPHONE:
+91 85868 45185 (Business Hours: 8:00 AM - 8:00 PM)

📱 WHATSAPP:
+91 85868 45185 (For quick chat & inquiries)

📧 EMAIL:
Kuntalagrosohna@gmail.com (For detailed inquiries and quotations)

🌐 WEBSITE:
kuntalagro.com (Visit our online portal)

🕐 BUSINESS HOURS:
Monday - Sunday: 8:00 AM - 8:00 PM
(Currently: Open · Closes 8:00 PM)

For order-related queries, product guidance, or technical support, please contact us during business hours. Emergency agricultural support available as per capacity.`
    },
    {
      id: 'account',
      title: 'User Accounts & Responsibilities',
      icon: <Shield className="w-5 h-5" />,
      content: `1. You must be at least 18 years old to create an account or make purchases.
2. Provide accurate agricultural business information to ensure we can offer the right guidance for your seasonal crops.
3. Maintain confidentiality of login credentials.
4. Notify us immediately of unauthorized account access by contacting +91 85868 45185.
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
• For technical product support and seasonal crop advice, visit our store or call +91 85868 45185 during business hours.`
    },
    {
      id: 'ordering',
      title: 'Ordering & Payment',
      icon: <CheckCircle className="w-5 h-5" />,
      content: `1. Prices are in Indian Rupees (INR) and subject to change without notice.
2. Orders are confirmed only after payment verification.
3. We accept UPI, net banking, cards, and agricultural credit options.
4. Bulk orders for large farms may require special arrangements - contact us directly at +91 85868 45185.
5. Contact support within 24 hours for order modifications.
6. We maintain fair pricing and do not push unnecessary items.
7. For quotations and bulk pricing, email Kuntalagrosohna@gmail.com.`
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <Truck className="w-5 h-5" />,
      content: `• We deliver quality agriculture products straight to your fields in Sohna, Gurugram, and surrounding areas.
• Pickup available from our store: Shop No.1, Ward No.19, near Civil Hospital, Sohna.
• Delivery times vary based on crop seasons, location, and rural accessibility.
• Rural delivery may take 5-10 business days depending on your village location.
• Perishable items like seeds require special handling - follow our storage instructions.
• Inspect deliveries immediately and report damages within 48 hours to +91 85868 45185.
• Seasonal demand during planting periods may affect delivery schedules.
• Free local delivery within Sohna may be available for orders above a certain value.`
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

For returns, visit our store or contact +91 85868 45185 during business hours. Refunds processed within 10-14 business days to original payment method.`
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

Maximum liability limited to the value of your order. We are a micro-enterprise serving local farmers with best efforts and expertise.

For urgent agricultural emergencies, contact local agricultural department or call emergency services.`
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      content: `• Kuntal Agro Agencies branding, website content (kuntalagro.com), and platform are protected intellectual property.
• Agricultural data and farm information you share remains your property.
• You grant us limited license to use anonymized, aggregated data for service improvement and understanding regional farming patterns.
• Do not reproduce platform content, product descriptions, or agricultural guidance without written permission.
• Our website design and development is protected.`
    },
    {
      id: 'testimonials',
      title: 'Customer Testimonials & Reviews',
      icon: <Users className="w-5 h-5" />,
      content: `• By submitting testimonials, you grant Kuntal Agro permission to use them for marketing with your first name and initial.
• We may edit testimonials for clarity and length while preserving original meaning.
• You can request removal of your testimonial by contacting Kuntalagrosohna@gmail.com.
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

Terminated accounts lose access to order history and future services. For account disputes, contact +91 85868 45185.`
    },
    {
      id: 'governing',
      title: 'Governing Law & Dispute Resolution',
      content: `These terms are governed by Indian law, specifically the laws of the State of Haryana. 

Disputes will be resolved in courts having jurisdiction in Gurugram District, Haryana, India. 

Agricultural-specific disputes may first be referred to the Haryana State Agriculture Department or local Krishi Vigyan Kendra for mediation.

We encourage direct communication to resolve any issues before legal proceedings. Contact us at +91 85868 45185 or visit our store in Sohna for dispute resolution.`
    },
    {
      id: 'updates',
      title: 'Updates to Terms',
      content: `We may update these terms periodically to reflect changes in our services, agricultural regulations, or business practices. 

Continued use after changes constitutes acceptance. 

Major changes affecting user rights will be notified via email, platform announcement, SMS to registered users, or displayed at our store.

Last updated: ${new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})}.

For latest terms, visit kuntalagro.com or our store.`
    }
  ];

  // Current time check for business hours
  const currentHour = new Date().getHours();
  const isOpen = currentHour >= 8 && currentHour < 20;
  const closingTime = "8:00 PM";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Kuntal Agro Agencies</h1>
              <p className="text-green-700 font-medium text-lg">Your trusted partner for quality agricultural products and solutions</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Terms & Conditions
          </h2>
          
          {/* Business Status */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {isOpen ? `Currently Open · Closes ${closingTime}` : 'Currently Closed · Opens 8:00 AM'}
            </span>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <MapPin className="inline w-4 h-4 mr-1" />
              Shop No.1, Ward No.19, Sohna
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Phone className="inline w-4 h-4 mr-1" />
              +91 85868 45185
            </div>
            <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              <Clock className="inline w-4 h-4 mr-1" />
              8AM-8PM, 7 Days
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-amber-800 font-medium">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Important: These terms affect your legal rights. Please read carefully before using our services.
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
                By using Kuntal Agro Agencies' agricultural platform and services, you acknowledge 
                reading and understanding these terms and agree to be bound by them as a 
                registered micro-enterprise serving the farming community of Sohna and surrounding areas.
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
                  I acknowledge these terms govern my use of Kuntal Agro Agencies' agricultural 
                  products and services from Shop No.1, Ward No.19, near Civil Hospital, Sohna, 
                  including ordering, delivery, returns, and the limitation of liability.
                </span>
              </label>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  if (accepted) {
                    alert('Thank you for accepting our Terms & Conditions! Welcome to Kuntal Agro Agencies - Your trusted partner for quality agricultural products and solutions.');
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
                onClick={() => window.open('mailto:Kuntalagrosohna@gmail.com?subject=Terms%20and%20Conditions%20Query', '_blank')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Questions
              </button>
              
              <button
                onClick={() => window.open('tel:+918586845185', '_blank')}
                className="px-6 py-3 border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Now (+91 85868 45185)
              </button>
            </div>
          </div>
        </div>

        {/* Contact Details Footer */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            Our Contact Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Our Location</h4>
                  <p className="text-gray-600 mb-1">Find us easily using Google Maps</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Shop Address:</p>
                    <p className="text-gray-700">Shop No.1, Ward No.19</p>
                    <p className="text-gray-700">Near Civil Hospital, Sohna Rural</p>
                    <p className="text-gray-700">Sohna, Haryana 122103</p>
                    <p className="text-gray-600 text-sm mt-1">Landmark: 63X8+FR Sohna, Haryana</p>
                    <button
                      onClick={() => window.open('https://maps.google.com/?q=Shop+No.1+ward+no.19+near+Civil+Hospital+Sohna+Haryana+122103', '_blank')}
                      className="mt-3 inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700"
                    >
                      <MapPin className="w-4 h-4" />
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Call Us</h4>
                  <p className="text-gray-600 mb-2">Available during business hours</p>
                  <div className="flex items-center gap-3">
                    <a 
                      href="tel:+918586845185"
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors"
                    >
                      +91 85868 45185
                    </a>
                    <button
                      onClick={() => window.open('tel:+918586845185', '_blank')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Call Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Email Us</h4>
                  <p className="text-gray-600 mb-2">For detailed inquiries and quotations</p>
                  <div className="flex items-center gap-3">
                    <a 
                      href="mailto:Kuntalagrosohna@gmail.com"
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      Kuntalagrosohna@gmail.com
                    </a>
                    <button
                      onClick={() => window.open('mailto:Kuntalagrosohna@gmail.com', '_blank')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Email Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Business Hours</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 font-medium">Monday - Sunday</p>
                    <p className="text-gray-700 text-lg font-bold">8:00 AM - 8:00 PM</p>
                    <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">
                        {isOpen ? `Currently Open · Closes ${closingTime}` : 'Currently Closed · Opens 8:00 AM'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Website</h4>
                  <button
                    onClick={() => window.open('https://kuntalagro.com', '_blank')}
                    className="text-green-600 font-medium hover:text-green-700 hover:underline"
                  >
                    kuntalagro.com
                  </button>
                  <p className="text-gray-600 text-sm mt-1">Visit our online portal for products and information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="mb-2 font-medium text-gray-700">
              For agricultural emergency contacts, pesticide poisoning help, or immediate crop advice:
            </p>
            <p className="mb-2">
              Call: <span className="font-bold text-green-700">+91 85868 45185</span> (During Business Hours: 8AM-8PM)
            </p>
            <p className="text-xs">
              Visit our store at Shop No.1, Ward No.19, near Civil Hospital, Sohna for in-person guidance.
            </p>
          </div>
          
          <p className="text-gray-600">
            <strong>Kuntal Agro Agencies</strong> • Your trusted partner for quality agricultural products and solutions
          </p>
          <p className="text-gray-500">
            Shop No.1, Ward No.19, near Civil Hospital, Sohna, Haryana 122103 • 
            Kuntalagrosohna@gmail.com • +91 85868 45185
          </p>
          <p className="text-gray-400 pt-2 border-t border-gray-200">
            © {new Date().getFullYear()} Kuntal Agro Agencies. All Rights Reserved.
            <br />
            Udyam Registered Micro-Enterprise • Established October 2018
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