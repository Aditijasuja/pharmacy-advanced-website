import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, Clock } from 'lucide-react';

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="bg-blue-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>+91 9876543210</span>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>City, Punjab</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Open: 8 AM - 10 PM</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">GK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>G.K. Medicos</h1>
                <p className="text-xs text-gray-500">Since 1997</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                data-testid="nav-home-link"
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`font-medium transition-colors ${
                  isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                data-testid="nav-about-link"
              >
                About
              </Link>
              <Link
                to="/services"
                className={`font-medium transition-colors ${
                  isActive('/services') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                data-testid="nav-services-link"
              >
                Services
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-colors ${
                  isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                data-testid="nav-contact-link"
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                data-testid="nav-login-button"
              >
                Staff Login
              </Link>
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2" data-testid="mobile-menu">
              <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link to="/about" className="block py-2 text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link to="/services" className="block py-2 text-gray-700 hover:text-blue-600">
                Services
              </Link>
              <Link to="/contact" className="block py-2 text-gray-700 hover:text-blue-600">
                Contact
              </Link>
              <Link to="/login" className="block py-2 text-blue-600 font-medium">
                Staff Login
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>G.K. Medicos</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted medical store in City since 1997. Quality medicines and healthcare products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Prescription Medicines</li>
                <li>Surgical Items</li>
                <li>Home Delivery</li>
                <li>24/7 Emergency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Punjab</li>
                <li>Phone: +91 9876543210</li>
                <li>Hours: 9 AM - 9 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 G.K. Medicos. All rights reserved. | Medical store in City</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;