import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const filtered = medicines.filter(
      (med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicine');
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (error) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medicine/${deleteId}`);
      toast.success('Medicine deleted successfully');
      setMedicines(medicines.filter((m) => m._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete medicine');
    }
  };

  const getStockStatus = (medicine) => {
    if (medicine.quantity === 0) return { label: 'Out of Stock', class: 'badge-danger' };
    if (medicine.quantity <= medicine.lowStockThreshold) return { label: 'Low Stock', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-success' };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading medicines...</div>;
  }

  return (
    <div className="space-y-6" data-testid="medicines-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Medicines
          </h1>
          <p className="text-gray-600">Manage your medicine inventory</p>
        </div>
        <Link to="/dashboard/add-medicine">
          <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-medicine-button">
            <Plus className="w-5 h-5 mr-2" />
            Add Medicine
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, batch number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-medicine-input"
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No medicines found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="medicines-table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Batch</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Expiry</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => {
                  const status = getStockStatus(medicine);
                  return (
                    <tr key={medicine._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{medicine.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{medicine.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{medicine.batchNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{medicine.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">₹{medicine.sellingPrice}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${status.class}`}>{status.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(medicine._id)}
                            data-testid={`delete-medicine-${medicine._id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medicine? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicinesPage;