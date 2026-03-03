import React, { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';

const CustomersPage = () => {
  const [customers, setCustomers]       = useState([]);
  const [search, setSearch]             = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode]     = useState(false);
  const [editId, setEditId]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [formData, setFormData]         = useState({ name: '', phone: '', address: '', creditLimit: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async (q = '') => {
    try {
      const res = await api.get(`/customers${q ? `?search=${q}` : ''}`);
      setCustomers(res.data.customers || []);
    } catch {
      toast.error('Failed to load customers');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchCustomers(e.target.value);
  };

  const openAdd = () => {
    setFormData({ name: '', phone: '', address: '', creditLimit: '' });
    setIsEditMode(false);
    setEditId(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (customer) => {
    setFormData({
      name:        customer.name,
      phone:       customer.phone        || '',
      address:     customer.address      || '',
      creditLimit: customer.creditLimit  || ''
    });
    setEditId(customer._id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete customer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, creditLimit: formData.creditLimit ? Number(formData.creditLimit) : 0 };
      if (isEditMode) {
        await api.put(`/customers/${editId}`, payload);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer added successfully');
      }
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditId(null);
      fetchCustomers(search);
    } catch (error) {
      toast.error(error.response?.data?.error || (isEditMode ? 'Failed to update' : 'Failed to add customer'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Customers
          </h1>
          <p className="text-gray-600">Manage your customers and credit accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openAdd}>
              <Plus className="w-5 h-5 mr-2" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update customer details' : 'Add a new customer to your store'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer full name" required
                  data-testid="customer-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  type="tel" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  data-testid="customer-phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Customer address"
                  data-testid="customer-address-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit (Rs.)</label>
                <Input
                  type="number" min="0" value={formData.creditLimit}
                  onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="0"
                  data-testid="customer-credit-input"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700"
                  data-testid="customer-submit-button">
                  {loading
                    ? (isEditMode ? 'Updating...' : 'Adding...')
                    : (isEditMode ? 'Update Customer' : 'Add Customer')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <Input
          value={search} onChange={handleSearch}
          placeholder="Search by name or phone..."
          className="max-w-sm"
        />
      </div>

      {/* Customer cards */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No customers found</p>
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
              Add First Customer
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map(customer => (
              <div key={customer._id} className="border border-gray-200 rounded-xl p-6 hover-lift"
                data-testid={`customer-card-${customer._id}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{customer.name}</h3>
                <div className="space-y-2 text-sm">
                  {customer.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="text-gray-900 font-medium">{customer.phone}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Credit Limit:</span>
                    <p className="text-gray-900 font-medium">Rs.{(customer.creditLimit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Balance Due:</span>
                    <p className={`font-semibold ${customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rs.{(customer.currentBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-gray-500">
                      Added: {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm"
                        onClick={() => navigate(`/dashboard/ledger/customer/${customer._id}`)}>
                        <BookOpen className="w-4 h-4 mr-1" /> Ledger
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(customer._id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;