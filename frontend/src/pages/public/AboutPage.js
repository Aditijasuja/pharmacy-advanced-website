import React from 'react';
import { Award, Users, Target, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="about-heading">
            About G.K. Medicos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Serving City community since 1997 with quality medicines and dedicated healthcare services.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Established in 1997, G.K. Medicos has been a trusted name in City, Punjab for over 25 years. We started with a simple mission: to provide quality medicines and healthcare products to our community.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Today, we serve thousands of customers with prescription medicines, surgical items, and healthcare essentials. Our commitment to quality, affordability, and customer service remains unwavering.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Located in the heart of City, we continue to be your reliable pharmacy in City for all medical needs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-7xl font-bold mb-4">25+</div>
                <div className="text-2xl font-semibold">Years of Service</div>
                <div className="text-blue-200 mt-2">Since 1997</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center" data-testid="value-quality">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality</h3>
            <p className="text-gray-600">Authentic medicines from verified suppliers</p>
          </div>

          <div className="text-center" data-testid="value-trust">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trust</h3>
            <p className="text-gray-600">Serving community for 25+ years</p>
          </div>

          <div className="text-center" data-testid="value-service">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Service</h3>
            <p className="text-gray-600">Dedicated customer care and support</p>
          </div>

          <div className="text-center" data-testid="value-care">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Care</h3>
            <p className="text-gray-600">Your health is our priority</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Visit Us Today
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Experience the best medical store in City. We're here to serve you.
          </p>
          <div className="text-blue-600 font-semibold text-lg">
            City, Punjab | Open: 9 AM - 9 PM
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;