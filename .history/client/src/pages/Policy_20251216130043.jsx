// PrivacyPolicy.jsx
import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Database,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Edit,
  Server,
  Globe,
  Smartphone,
  CreditCard,
  Calendar,
  Crop,
  Sprout,
  Thermometer,
  truck
  Key,
  MessageSquare,
  Camera,
  History
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('data-collection');
  const [showConsentOptions, setShowConsentOptions] = useState(false);
  const [consentPreferences, setConsentPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    location: false,
    personalization: true
  });

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const updateConsent = (key, value) => {
    setConsentPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const dataCategories = [
    {
      category: 'Personal Information',
      icon: <User className="w-5 h-5" />,
      examples: [
        'Full name, date of birth',
        'Contact details (phone, email)',
        'Farm/GST registration number',
        'Bank account details for payments'
      ],
      purpose: 'Account creation, order processing, legal compliance'
    },
    {
      category: 'Farm & Land Data',
      icon: <Crop className="w-5 h-5" />,
      examples: [
        'Land size and location',
        'Soil type and quality reports',
        'Crop history and patterns',
        'Irrigation methods used'
      ],
      purpose: 'Product recommendations, yield analysis, customized advice'
    },
    {
      category: 'Transaction Data',
      icon: <CreditCard className="w-5 h-5" />,
      examples: [
        'Purchase history',
        'Payment methods and details',
        'Order values and frequencies',
        'Return/refund records'
      ],
      purpose: 'Billing, financial records, service improvement'
    },
    {
      category: 'Technical Data',
      icon: <Smartphone className="w-5 h-5" />,
      examples: [
        'IP address, device information',
        'Browser type and version',
        'App usage patterns',
        'Location data (with consent)'
      ],
      purpose: 'Security, analytics, app optimization'
    },
    {
      category: 'Communication Data',
      icon: <MessageSquare className="w-5 h-5" />,
      examples: [
        'Customer support queries',
        'Feedback and reviews',
        'Survey responses',
        'Service announcements'
      ],
      purpose: 'Customer service, quality improvement'
    }
  ];

  const dataUsagePurposes = [
    {
      purpose: 'Service Delivery',
      description: 'Processing orders, deliveries, and payments',
      legalBasis: 'Contractual necessity',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
    },
    {
      purpose: 'Personalization',
      description: 'Customized product recommendations based on farm needs',
      legalBasis: 'Legitimate interest',
      icon: <Sprout className="w-5 h-5 text-emerald-600" />
    },
    {
      purpose: 'Analytics & Research',
      description: 'Improving products and understanding agricultural trends',
      legalBasis: 'Legitimate interest',
      icon: <Database className="w-5 h-5 text-emerald-600" />
    },
    {
      purpose: 'Marketing Communications',
      description: 'Seasonal offers, new product updates',
      legalBasis: 'Consent (opt-in required)',
      icon: <Mail className="w-5 h-5 text-emerald-600" />
    },
    {
      purpose: 'Legal Compliance',
      description: 'Tax records, agricultural regulations',
      legalBasis: 'Legal obligation',
      icon: <FileText className="w-5 h-5 text-emerald-600" />
    }
  ];

  const dataSharingPartners = [
    {
      partner: 'Payment Processors',
      dataShared: 'Transaction details',
      purpose: 'Secure payment processing',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      partner: 'Logistics Partners',
      dataShared: 'Delivery address, contact',
      purpose: 'Product delivery to farm',
      icon: <Truck className="w-5 h-5" />
    },
    {
      partner: 'Agricultural Authorities',
      dataShared: 'Purchase records (mandatory)',
      purpose: 'Regulatory compliance',
      icon: <Shield className="w-5 h-5" />
    },
    {
      partner: 'Analytics Providers',
      dataShared: 'Anonymized usage data',
      purpose: 'Service improvement',
      icon: <Database className="w-5 h-5" />
    },
    {
      partner: 'Marketing Partners',
      dataShared: 'Contact info (with consent)',
      purpose: 'Relevant offers',
      icon: <Mail className="w-5 h-5" />
    }
  ];

  const userRights = [
    {
      right: 'Right to Access',
      description: 'Request copy of your personal data',
      icon: <Eye className="w-5 h-5" />,
      action: 'Download Data Report'
    },
    {
      right: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete data',
      icon: <Edit className="w-5 h-5" />,
      action: 'Update Information'
    },
    {
      right: 'Right to Erasure',
      description: 'Request deletion of personal data',
      icon: <Trash2 className="w-5 h-5" />,
      action: 'Request Deletion'
    },
    {
      right: 'Right to Restrict Processing',
      description: 'Limit how we use your data',
      icon: <Lock className="w-5 h-5" />,
      action: 'Manage Preferences'
    },
    {
      right: 'Right to Data Portability',
      description: 'Receive your data in usable format',
      icon: <Download className="w-5 h-5" />,
      action: 'Export Data'
    },
    {
      right: 'Right to Object',
      description: 'Object to certain data processing',
      icon: <XCircle className="w-5 h-5" />,
      action: 'Opt-Out Options'
    }
  ];

  const retentionPeriods = [
    {
      dataType: 'Account Information',
      period: '7 years after last activity',
      reason: 'Legal and tax requirements'
    },
    {
      dataType: 'Transaction Records',
      period: '10 years',
      reason: 'Financial regulations'
    },
    {
      dataType: 'Customer Support Communications',
      period: '5 years',
      reason: 'Service quality and dispute resolution'
    },
    {
      dataType: 'Marketing Preferences',
      period: 'Until consent withdrawn',
      reason: 'User choice'
    },
    {
      dataType: 'Website Analytics',
      period: '26 months',
      reason: 'Trend analysis'
    }
  ];

  const securityMeasures = [
    {
      measure: 'Encryption',
      description: 'All sensitive data encrypted in transit and at rest',
      icon: <Lock className="w-5 h-5" />
    },
    {
      measure: 'Access Controls',
      description: 'Role-based access to customer data',
      icon: <Key className="w-5 h-5" />
    },
    {
      measure: 'Regular Audits',
      description: 'Quarterly security assessments',
      icon: <Shield className="w-5 h-5" />
    },
    {
      measure: 'Employee Training',
      description: 'Annual data protection training',
      icon: <User className="w-5 h-5" />
    },
    {
      measure: 'Incident Response',
      description: '24/7 monitoring and response team',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction & Scope',
      icon: <FileText className="w-5 h-5" />,
      content: `This Privacy Policy explains how Kuntal Agro ("we," "us," or "our") collects, uses, discloses, and protects your personal information when you use our agricultural products platform, mobile application, and related services.

Scope: This policy applies to all farmers, agricultural businesses, and users accessing Kuntal Agro services in India.`
    },
    {
      id: 'data-collection',
      title: 'Data We Collect',
      icon: <Database className="w-5 h-5" />,
      content: `We collect various types of information to provide and improve our agricultural services:

1. Information You Provide:
   - Registration details (name, contact, farm details)
   - Order information and payment details
   - Communication with customer support
   - Farm surveys and feedback

2. Automatically Collected:
   - Device and browser information
   - Usage patterns and preferences
   - Location data (with consent)
   - Log data and IP addresses`
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Data',
      icon: <CheckCircle className="w-5 h-5" />,
      content: `Your data helps us:
• Process orders and deliveries
• Provide personalized agricultural recommendations
• Improve product offerings based on regional needs
• Comply with agricultural regulations
• Send relevant seasonal updates (with consent)
• Prevent fraud and ensure security
• Conduct research to benefit farming community`
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing & Disclosure',
      icon: <Globe className="w-5 h-5" />,
      content: `We may share your information with:
• Delivery partners for product transportation
• Payment processors for transaction completion
• Government agricultural departments (as required by law)
• Analytics providers for service improvement
• Marketing partners (only with explicit consent)

We never sell your personal data to third parties.`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Shield className="w-5 h-5" />,
      content: `We implement industry-standard security measures:
• SSL encryption for all data transfers
• Secure servers with firewalls
• Regular security audits and updates
• Employee access controls and training
• Incident response protocols

Despite our efforts, no system is 100% secure. We encourage you to use strong passwords and report any suspicious activity.`
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <History className="w-5 h-5" />,
      content: `We retain personal data only as long as necessary:
• Account data: 7 years after last activity
• Transaction records: 10 years for tax purposes
• Communication records: 5 years
• Marketing preferences: Until consent withdrawn

After retention periods expire, data is securely deleted or anonymized.`
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <User className="w-5 h-5" />,
      content: `As a user, you have rights under applicable laws:
1. Access your personal data
2. Correct inaccurate information
3. Delete your data (subject to legal requirements)
4. Restrict or object to processing
5. Data portability
6. Withdraw consent for marketing

To exercise these rights, contact our Data Protection Officer.`
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `Our services are not intended for individuals under 18 years of age. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us immediately for removal.`
    },
    {
      id: 'changes',
      title: 'Policy Updates',
      icon: <Calendar className="w-5 h-5" />,
      content: `We may update this policy periodically. Significant changes will be:
• Notified via email or app notification
• Highlighted on our website
• Accompanied by a 30-day notice period

Continued use after changes constitutes acceptance. Last updated: ${new Date().toLocaleDateString()}.`
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Phone className="w-5 h-5" />,
      content: `For privacy-related inquiries:
Data Protection Officer: dpo@kuntalagro.com
Phone: 1800-180-PRIVACY
Address: Kuntal Agro, Data Protection Office,
Agricultural Complex, [City], [State] - Pincode

Response time: Within 30 days for formal requests.`
    }
  ];

  const handleConsentUpdate = () => {
    // In a real application, this would send data to your backend
    alert('Consent preferences updated successfully!');
    setShowConsentOptions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Shield className="w-12 h-12 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Kuntal Agro</h1>
              <p className="text-emerald-700 font-semibold">Protecting Your Agricultural Data</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy is our priority. Learn how we collect, use, and protect your agricultural data.
          </p>
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg max-w-3xl mx-auto">
            <p className="text-emerald-800 font-medium">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Important: This policy complies with Indian data protection regulations and agricultural data guidelines.
            </p>
          </div>
        </div>

        {/* Consent Management Banner */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Manage Your Privacy Preferences
                </h3>
                <p className="text-gray-600 text-sm">
                  Control how we use your data for marketing and personalization
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConsentOptions(!showConsentOptions)}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {showConsentOptions ? 'Hide Options' : 'Manage Consent'}
            </button>
          </div>

          {showConsentOptions && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Your Consent Preferences</h4>
              <div className="space-y-4">
                {Object.entries(consentPreferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {key === 'essential' && <Lock className="w-5 h-5 text-blue-600" />}
                      {key === 'analytics' && <Database className="w-5 h-5 text-purple-600" />}
                      {key === 'marketing' && <Mail className="w-5 h-5 text-orange-600" />}
                      {key === 'location' && <MapPin className="w-5 h-5 text-red-600" />}
                      {key === 'personalization' && <Sprout className="w-5 h-5 text-emerald-600" />}
                      <div>
                        <span className="font-medium text-gray-800 capitalize">{key.replace('-', ' ')}</span>
                        <p className="text-sm text-gray-500">
                          {key === 'essential' && 'Required for service operation'}
                          {key === 'analytics' && 'Helps us improve our services'}
                          {key === 'marketing' && 'Receive offers and updates'}
                          {key === 'location' && 'Location-based recommendations'}
                          {key === 'personalization' && 'Customized farming advice'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key !== 'essential' && (
                        <>
                          <button
                            onClick={() => updateConsent(key, false)}
                            className={`px-3 py-1 rounded ${!value ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-200 text-gray-700'}`}
                          >
                            Opt-Out
                          </button>
                          <button
                            onClick={() => updateConsent(key, true)}
                            className={`px-3 py-1 rounded ${value ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-gray-200 text-gray-700'}`}
                          >
                            Opt-In
                          </button>
                        </>
                      )}
                      {key === 'essential' && (
                        <span className="text-sm text-gray-500 font-medium">Required</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleConsentUpdate}
                    className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setConsentPreferences({
                      essential: true,
                      analytics: false,
                      marketing: false,
                      location: false,
                      personalization: false
                    })}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Opt-Out All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Categories
              </h3>
              <div className="space-y-4">
                {dataCategories.map((cat, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      {cat.icon}
                      <h4 className="font-bold text-gray-800">{cat.category}</h4>
                    </div>
                    <div className="space-y-1 mb-3">
                      {cat.examples.map((example, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                          {example}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded">
                      <span className="font-semibold">Purpose:</span> {cat.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Data Retention Periods
              </h3>
              <div className="space-y-4">
                {retentionPeriods.map((item, index) => (
                  <div key={index} className="border-l-4 border-emerald-400 pl-4 py-2">
                    <h4 className="font-bold text-gray-800">{item.dataType}</h4>
                    <p className="text-emerald-700 font-semibold">{item.period}</p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Detailed Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border-b">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detailed Privacy Policy
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${activeSection === section.id
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-700 text-sm">{section.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {sections.map((section) => (
                  <div key={section.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex justify-between items-center w-full text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 text-emerald-600">
                          {section.icon}
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
                        <div className="prose prose-blue max-w-none">
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

            {/* User Rights Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Your Data Protection Rights
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRights.map((right, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      {right.icon}
                      <h4 className="font-bold text-gray-800">{right.right}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{right.description}</p>
                    <button className="text-emerald-700 font-semibold text-sm hover:text-emerald-800">
                      {right.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Measures */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Our Security Measures
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityMeasures.map((measure, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      {measure.icon}
                      <h4 className="font-bold text-gray-800">{measure.measure}</h4>
                    </div>
                    <p className="text-gray-600">{measure.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Sharing & Partners */}
        <div className="bg-white rounded-xl shadow-lg p-8 my-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Data Sharing Partners
          </h3>
          <div className="space-y-6">
            {dataSharingPartners.map((partner, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {partner.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{partner.partner}</h4>
                    <p className="text-sm text-gray-600">Data shared: {partner.dataShared}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-700 font-semibold">{partner.purpose}</p>
                  <p className="text-xs text-gray-500">Legally binding agreements in place</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Actions */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Our DPO</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:dpo@kuntalagro.com" className="text-emerald-700 hover:text-emerald-800">
                      dpo@kuntalagro.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:1800180PRIVACY" className="text-emerald-700 hover:text-emerald-800">
                      1800-180-PRIVACY
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">
                      Kuntal Agro Data Protection Office<br />
                      Agricultural Business Park<br />
                      [Your City], India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Take Action</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Download Full Policy</span>
                    <Download className="w-5 h-5 text-emerald-600" />
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Submit Data Access Request</span>
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Report Privacy Concern</span>
                    <AlertTriangle className="w-5 h-5 text-emerald-600" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t text-gray-500 text-sm">
          <p className="mb-2">
            <strong>Kuntal Agro Data Protection</strong> • 
            Policy Version: 2.1 • 
            Effective Date: {new Date().toLocaleDateString('en-IN')}
          </p>
          <p>
            For agricultural emergency or data breach reports, 
            contact: <span className="font-bold text-emerald-700">security@kuntalagro.com</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-1 bg-emerald-300"></div>
            <Shield className="w-5 h-5 text-emerald-500" />
            <div className="w-12 h-1 bg-emerald-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;