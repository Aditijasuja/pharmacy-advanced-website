import React from 'react';
import { Pill, Truck, Clock, Phone, ShieldCheck, Package } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: Pill,
      title: 'Prescription Medicines',
      description: 'Wide range of prescription and over-the-counter medicines from trusted pharmaceutical companies.',
      features: ['Branded medicines', 'Generic alternatives', 'Doctor-prescribed drugs', 'Ayurvedic medicines']
    },
    {
      icon: Package,
      title: 'Surgical Items',
      description: 'Complete range of surgical items and medical equipment for hospitals and clinics in Fazilka.',
      features: ['Surgical instruments', 'Medical disposables', 'Hospital supplies', 'First aid kits']
    },
    {
      icon: Truck,
      title: 'Home Delivery',
      description: 'Fast and reliable medicine delivery service across Fazilka and nearby areas.',
      features: ['Free delivery on orders above ₹500', 'Same-day delivery', 'Safe packaging', 'Track your order']
    },
    {
      icon: Clock,
      title: '24/7 Emergency Service',
      description: 'Round-the-clock availability for emergency medicine requirements.',
      features: ['Emergency hotline', 'Night service', 'Urgent prescriptions', 'On-call pharmacist']
    },
    {
      icon: ShieldCheck,
      title: 'Quality Assurance',
      description: 'All medicines are quality-checked and stored in optimal conditions.',
      features: ['Verified suppliers', 'Proper storage', 'Expiry date checks', 'Authentic products']
    },
    {
      icon: Phone,
      title: 'Consultation Support',
      description: 'Expert advice and support for your healthcare needs.',
      features: ['Pharmacist guidance', 'Medicine information', 'Dosage instructions', 'Drug interaction checks']
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="services-heading">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive pharmacy services in Fazilka for all your healthcare needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover-lift"
                data-testid={`service-${index}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Need Medicines or Healthcare Products?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact us for prescription medicines, surgical items, and medicine home delivery in Fazilka
          </p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all"
            data-testid="call-us-button"
          >
            <Phone className="w-5 h-5" />
            <span>Call: +91 98765-43210</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;