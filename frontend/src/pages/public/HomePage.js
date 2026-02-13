import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Pill, Clock, Award, MapPin } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Trusted Since 1997</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="hero-heading">
                Your Trusted Medical Store in Fazilka
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
                Quality medicines, surgical items, and healthcare products with home delivery services. Serving the community for over 25 years.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all inline-flex items-center space-x-2 hover-lift"
                  data-testid="contact-us-button"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+919876543210"
                  className="bg-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-400 transition-all inline-flex items-center space-x-2"
                  data-testid="call-now-button"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl transform -rotate-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">5000+</p>
                      <p className="text-sm text-gray-600">Medicines</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">14 Hours</p>
                      <p className="text-sm text-gray-600">Daily Open</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">25+ Years</p>
                      <p className="text-sm text-gray-600">Experience</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">Fazilka</p>
                      <p className="text-sm text-gray-600">Punjab</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Why Choose G.K. Medicos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your health is our priority. We provide quality medicines and excellent service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl hover-lift" data-testid="feature-quality">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Assured</h3>
              <p className="text-gray-600 leading-relaxed">
                All medicines are sourced from verified suppliers and stored in optimal conditions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl hover-lift" data-testid="feature-delivery">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Home Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick and safe medicine delivery to your doorstep in Fazilka and nearby areas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl hover-lift" data-testid="feature-emergency">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Emergency</h3>
              <p className="text-gray-600 leading-relaxed">
                Emergency medicines available round the clock. Call us anytime for urgent needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Need Medicines? Order Now!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Call us or visit our store for prescription medicines, surgical items, and healthcare products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+919876543210"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all inline-flex items-center space-x-2"
              data-testid="cta-call-button"
            >
              <Phone className="w-5 h-5" />
              <span>Call: +91 98765-43210</span>
            </a>
            <Link
              to="/contact"
              className="bg-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-400 transition-all"
              data-testid="cta-contact-button"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;