import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'sonner';

const StaffDashboard = () => {
  const [todaySales, setTodaySales] = useState([]);
  const [stats, setStats] = useState({
    salesCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await api.get('/sales');
      const sales = response.data;
      
      setTodaySales(sales);
      setStats({
        salesCount: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      });
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="staff-dashboard">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Staff Dashboard
        </h1>
        <p className="text-gray-600">Manage your daily sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="stat-card" data-testid="stat-sales-count">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
          <p className="text-3xl font-bold text-gray-900">{stats.salesCount}</p>
        </div>

        <div className="stat-card" data-testid="stat-total-revenue">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-100 mb-3">Create New Bill</p>
          <Link
            to="/dashboard/create-bill"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all"
            data-testid="create-bill-button"
          >
            New Bill
          </Link>
        </div>
      </div>

      {/* Today's Sales */}
      <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="today-sales-table">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Sales</h3>
        {todaySales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No sales today yet</p>
            <Link
              to="/dashboard/create-bill"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all"
            >
              Create First Bill
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.map((sale) => (
                  <tr key={sale._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {sale.medicines.length} item(s)
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ₹{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-success capitalize">{sale.paymentMode}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      ₹{sale.discount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;