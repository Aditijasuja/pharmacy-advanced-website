import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const SettingsPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="max-w-4xl" data-testid="settings-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Settings
        </h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Name
              </label>
              <Input type="text" value={user?.name || ''} disabled data-testid="user-name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <Input type="email" value={user?.email || ''} disabled data-testid="user-email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <Input type="text" value={user?.role || ''} disabled className="capitalize" data-testid="user-role" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">About Application</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-gray-900">Application:</strong> G.K. Medicos Pharmacy Management System
            </p>
            <p>
              <strong className="text-gray-900">Version:</strong> 1.0.0
            </p>
            <p>
              <strong className="text-gray-900">Business:</strong> G.K. Medicos, Fazilka, Punjab
            </p>
            <p>
              <strong className="text-gray-900">Contact:</strong> +91 98765-43210
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;