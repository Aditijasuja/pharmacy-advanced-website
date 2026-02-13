import React, { useState, useEffect } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ReportsPage = () => {
  const [profitData, setProfitData] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (start = '', end = '') => {
    try {
      let profitUrl = '/reports/profit';
      const params = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) profitUrl += `?${params.join('&')}`;

      const [profit, topSell, summary] = await Promise.all([
        api.get(profitUrl),
        api.get('/reports/top-selling'),
        api.get('/reports/monthly-summary'),
      ]);

      setProfitData(profit.data);
      setTopSelling(topSell.data);
      setMonthlySummary(summary.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchReports(startDate, endDate);
  };

  const exportCSV = () => {
    const csvData = [
      ['Month', 'Revenue', 'Profit', 'Sales Count'],
      ...monthlySummary.map((item) => [
        new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        item.totalRevenue,
        item.totalProfit,
        item.salesCount,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  const monthlyRevenueData = {
    labels: monthlySummary.map((item) =>
      new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Revenue',
        data: monthlySummary.map((item) => item.totalRevenue),
        backgroundColor: 'rgba(0, 102, 204, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const profitTrendData = {
    labels: monthlySummary.map((item) =>
      new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' })
    ),
    datasets: [
      {
        label: 'Profit',
        data: monthlySummary.map((item) => item.totalProfit),
        borderColor: 'rgba(5, 150, 105, 1)',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700" data-testid="export-csv-button">
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Date Range Filter</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="report-start-date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="report-end-date"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFilter} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="apply-filter-button">
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="stat-card" data-testid="total-revenue-stat">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{profitData?.totalRevenue?.toLocaleString() || 0}</p>
        </div>

        <div className="stat-card" data-testid="total-profit-stat">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Profit</p>
          <p className="text-3xl font-bold text-green-600">₹{profitData?.totalProfit?.toLocaleString() || 0}</p>
        </div>

        <div className="stat-card" data-testid="sales-count-stat">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">{profitData?.salesCount || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="revenue-chart">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-64">
            <Bar data={monthlyRevenueData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="profit-chart">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Trend</h3>
          <div className="h-64">
            <Line data={profitTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="top-selling-table">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Medicines</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Medicine</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity Sold</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSelling.map((item, index) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-bold text-blue-600">#{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.totalQuantity} units</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    ₹{item.totalRevenue?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;