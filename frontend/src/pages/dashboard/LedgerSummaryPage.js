import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Users, Truck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { Button } from '../../components/ui/button';

const LedgerSummaryPage = () => {
  const [summary, setSummary]           = useState(null);
  const [receivables, setReceivables]   = useState(null);
  const [payables, setPayables]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('overview');
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, r, p] = await Promise.all([
        api.get('/ledger/summary'),
        api.get('/ledger/receivables'),
        api.get('/ledger/payables'),
      ]);
      setSummary(s.data);
      setReceivables(r.data);
      setPayables(p.data);
    } catch {
      toast.error('Failed to load ledger summary');
    } finally {
      setLoading(false);
    }
  };

  const txConfig = {
    sale:        { label: 'Sale',        color: 'bg-blue-100 text-blue-700'    },
    purchase:    { label: 'Purchase',    color: 'bg-purple-100 text-purple-700' },
    payment_in:  { label: 'Payment In',  color: 'bg-green-100 text-green-700'  },
    payment_out: { label: 'Payment Out', color: 'bg-orange-100 text-orange-700' },
    return:      { label: 'Return',      color: 'bg-gray-100 text-gray-700'    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Ledger Summary
        </h1>
        <p className="text-gray-600">Overview of receivables, payables and recent transactions</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Receivable</p>
          <p className="text-2xl font-bold text-red-600">
            Rs.{(summary?.totalReceivable || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{summary?.customersWithDue || 0} customers with due</p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingDown className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Payable</p>
          <p className="text-2xl font-bold text-orange-600">
            Rs.{(summary?.totalPayable || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{summary?.suppliersWithDue || 0} suppliers with due</p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Net Position</p>
          <p className={`text-2xl font-bold ${(summary?.netPosition || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Rs.{(summary?.netPosition || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(summary?.netPosition || 0) >= 0 ? 'You are owed more' : 'You owe more'}
          </p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Customer Advance</p>
          <p className="text-2xl font-bold text-green-600">
            Rs.{(summary?.customerAdvance || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Overpaid by customers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { key: 'overview',     label: 'Recent Transactions' },
          { key: 'receivables',  label: 'Receivables'         },
          { key: 'payables',     label: 'Payables'            },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          {!summary?.recentTransactions?.length ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Party</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Debit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Credit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map(entry => {
                    const tx = txConfig[entry.transactionType] || { label: entry.transactionType, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                          {entry.partyType}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tx.color}`}>
                            {tx.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                          {entry.debit > 0 ? `Rs.${entry.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-red-600 font-medium">
                          {entry.credit > 0 ? `Rs.${entry.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold">
                          <span className={entry.balanceAfter > 0 ? 'text-red-600' : 'text-green-600'}>
                            Rs.{entry.balanceAfter.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'receivables' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Customers with Due — Total: Rs.{(receivables?.totalReceivable || 0).toLocaleString()}
            </h3>
          </div>
          {!receivables?.customers?.length ? (
            <p className="text-center text-gray-500 py-8">No outstanding receivables</p>
          ) : (
            <div className="space-y-3">
              {receivables.customers.map(c => (
                <div key={c._id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600">Rs.{c.currentBalance.toLocaleString()}</span>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => navigate(`/dashboard/ledger/customer/${c._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payables' && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Suppliers with Due — Total: Rs.{(payables?.totalPayable || 0).toLocaleString()}
            </h3>
          </div>
          {!payables?.suppliers?.length ? (
            <p className="text-center text-gray-500 py-8">No outstanding payables</p>
          ) : (
            <div className="space-y-3">
              {payables.suppliers.map(s => (
                <div key={s._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-orange-600">Rs.{s.currentBalance.toLocaleString()}</span>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => navigate(`/dashboard/ledger/supplier/${s._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LedgerSummaryPage;