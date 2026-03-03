import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const StoreProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gstNumber: '',
    invoicePrefix: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get('/store');
        const { name, phone, address, gstNumber, invoicePrefix, logo } = response.data;
        setFormData({
          name: name || '',
          phone: phone || '',
          address: address || '',
          gstNumber: gstNumber || '',
          invoicePrefix: invoicePrefix || 'INV',
          logo: logo || ''
        });
      } catch (error) {
        toast.error('Failed to load store details');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/store', formData);
      // Update stored user's store name
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.store) {
        storedUser.store.name = formData.name;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      toast.success('Store profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Store Profile
        </h1>
        <p className="text-gray-600 mt-1">Manage your store details and settings</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Store Information
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your pharmacy name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full store address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number
            </label>
            <Input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="e.g. 22AAAAA0000A1Z5"
            />
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">
            Invoice Settings
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Prefix
            </label>
            <Input
              type="text"
              name="invoicePrefix"
              value={formData.invoicePrefix}
              onChange={handleChange}
              placeholder="e.g. INV"
              maxLength={10}
            />
            <p className="text-xs text-gray-400 mt-1">
              Invoices will be numbered like: {formData.invoicePrefix || 'INV'}-000001
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://your-logo-url.com/logo.png"
            />
            {formData.logo && (
              <img
                src={formData.logo}
                alt="Store logo preview"
                className="mt-3 h-16 w-16 object-contain rounded-lg border border-gray-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 font-semibold"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreProfilePage;