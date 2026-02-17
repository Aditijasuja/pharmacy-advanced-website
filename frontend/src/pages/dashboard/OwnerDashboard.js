import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Calendar, Package } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../utils/api';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    lowStockCount: 0,
    expiringCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchDashboardData();
}, []);



  const fetchDashboardData = async () => {
    try {
      const [daily, monthly, lowStock, expiring, sales, topSell, summary] = await Promise.all([
        api.get('/sales/daily'),
        api.get('/sales/monthly'),
        api.get('/medicine/low-stock'),
        api.get('/medicine/expiry-alert'),
        api.get('/sales?limit=5'),
        api.get('/reports/top-selling'),
        api.get('/reports/monthly-summary')
      ]);

      setStats({
        dailyRevenue: daily.data.totalRevenue || 0,
        monthlyRevenue: monthly.data.totalRevenue || 0,
        monthlyProfit: monthly.data.totalProfit || 0,
        lowStockCount: lowStock.data.length,
        expiringCount: expiring.data.length
      });

      setRecentSales(sales.data.slice(0, 5));
      setLowStockMedicines(lowStock.data.slice(0, 5));
      setExpiringMedicines(expiring.data.slice(0, 5));
      setTopSelling(topSell.data);
      setMonthlySummary(summary.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const monthlyRevenueData = {
    labels: monthlySummary.map(item => 
      new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Revenue',
        data: monthlySummary.map(item => item.totalRevenue),
        backgroundColor: 'rgba(0, 102, 204, 0.8)',
        borderColor: 'rgba(0, 102, 204, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const profitTrendData = {
    labels: monthlySummary.map(item => 
      new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Profit',
        data: monthlySummary.map(item => item.totalProfit),
        borderColor: 'rgba(5, 150, 105, 1)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(5, 150, 105, 1)',
      },
    ],
  };

  const topSellingData = {
    labels: topSelling.map(item => item.name),
    datasets: [
      {
        data: topSelling.map(item => item.totalQuantity),
        backgroundColor: [
          'rgba(0, 102, 204, 0.8)',
          'rgba(5, 150, 105, 0.8)',
          'rgba(217, 119, 6, 0.8)',
          'rgba(220, 38, 38, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="owner-dashboard">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Owner Dashboard
        </h1>
        <p className="text-gray-600">Overview of your pharmacy business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="stat-card" data-testid="stat-daily-revenue">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
          <p className="text-2xl font-bold text-gray-900">₹{stats.dailyRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card" data-testid="stat-monthly-revenue">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card" data-testid="stat-monthly-profit">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Monthly Profit</p>
          <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyProfit.toLocaleString()}</p>
        </div>

        <div className="stat-card" data-testid="stat-low-stock">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</p>
        </div>

        <div className="stat-card" data-testid="stat-expiring-soon">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
          <p className="text-2xl font-bold text-red-600">{stats.expiringCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="monthly-revenue-chart">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <Bar data={monthlyRevenueData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="profit-trend-chart">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Trend</h3>
          <div className="h-64">
            <Line data={profitTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="top-selling-chart">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Selling</h3>
          <div className="h-64">
            <Doughnut data={topSellingData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="recent-sales-table">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ₹{sale.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge badge-success capitalize">{sale.paymentMode}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sale.createdBy?.name || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="low-stock-alert">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="space-y-3">
            {lowStockMedicines.length === 0 ? (
              <p className="text-sm text-gray-600">No low stock items</p>
            ) : (
              lowStockMedicines.map((medicine) => (
                <div key={medicine._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-600">Batch: {medicine.batchNumber}</p>
                  </div>
                  <span className="badge badge-warning">{medicine.quantity} left</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="expiring-medicines-alert">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Expiring Soon</h3>
          </div>
          <div className="space-y-3">
            {expiringMedicines.length === 0 ? (
              <p className="text-sm text-gray-600">No expiring medicines</p>
            ) : (
              expiringMedicines.map((medicine) => (
                <div key={medicine._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-xs text-gray-600">Batch: {medicine.batchNumber}</p>
                  </div>
                  <span className="badge badge-danger">
                    {new Date(medicine.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;