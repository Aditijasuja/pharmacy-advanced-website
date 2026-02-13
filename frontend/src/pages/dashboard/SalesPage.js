import React, { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchSales();
  }, []);

  const fetchSales = async (start = '', end = '') => {
    try {
      let url = '/sales';
      const params = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await api.get(url);
      setSales(response.data);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchSales(startDate, endDate);
  };

  const getTotalRevenue = () => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading sales...</div>;
  }

  return (
    <div className="space-y-6" data-testid="sales-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Sales History
        </h1>
        <p className="text-gray-600">
          {user?.role === 'staff' ? "Your today's sales" : 'All sales records'}
        </p>
      </div>

      {user?.role === 'owner' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Filter by Date</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="start-date-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="end-date-input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                data-testid="filter-button"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">{sales.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">₹{getTotalRevenue().toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600 mb-1">Average Sale</p>
          <p className="text-3xl font-bold text-blue-600">
            ₹{sales.length > 0 ? (getTotalRevenue() / sales.length).toFixed(2) : 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="sales-table">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Records</h3>
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No sales records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                  {user?.role === 'owner' && (
                    <>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Staff</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div>
                        {sale.medicines.slice(0, 2).map((med, idx) => (
                          <div key={idx}>{med.name} (x{med.quantity})</div>
                        ))}
                        {sale.medicines.length > 2 && (
                          <div className="text-xs text-gray-500">+{sale.medicines.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ₹{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      ₹{sale.discount || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-success capitalize">{sale.paymentMode}</span>
                    </td>
                    {user?.role === 'owner' && (
                      <>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600">
                          ₹{sale.profitAmount?.toFixed(2) || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {sale.createdBy?.name || 'N/A'}
                        </td>
                      </>
                    )}
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

export default SalesPage;