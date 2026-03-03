import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

const LedgerStatementPage = () => {
  const { partyType, partyId } = useParams();
  const navigate = useNavigate();

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMode: 'cash', note: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => { fetchStatement(); }, [partyType, partyId]);

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate)   params.append('endDate',   endDate);
      const res = await api.get(`/ledger/statement/${partyType}/${partyId}?${params}`);
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load statement');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      await api.post('/ledger/payment', {
        partyType,
        partyId,
        amount:      Number(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        note:        paymentForm.note
      });
      toast.success('Payment recorded successfully');
      setPaymentOpen(false);
      setPaymentForm({ amount: '', paymentMode: 'cash', note: '' });
      fetchStatement();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const txConfig = {
    sale:        { label: 'Sale',        color: 'bg-blue-100 text-blue-700'    },
    purchase:    { label: 'Purchase',    color: 'bg-purple-100 text-purple-700' },
    payment_in:  { label: 'Payment In',  color: 'bg-green-100 text-green-700'  },
    payment_out: { label: 'Payment Out', color: 'bg-orange-100 text-orange-700' },
    return:      { label: 'Return',      color: 'bg-gray-100 text-gray-700'    },
  };

  const backPath = partyType === 'customer' ? '/dashboard/customers' : '/dashboard/suppliers';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {data?.party?.name || 'Ledger Statement'}
            </h1>
            <p className="text-gray-600 capitalize">{partyType} — {data?.party?.phone || ''}</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setPaymentOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Payment
        </Button>
      </div>

      {/* Date filter */}
      <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
        </div>
        <Button onClick={fetchStatement} className="bg-blue-600 hover:bg-blue-700">Apply</Button>
        <Button variant="outline" onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchStatement, 0); }}>
          Clear
        </Button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-gray-900">Rs.{(data.openingBalance || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-1">Total Credit</p>
            <p className="text-xl font-bold text-red-600">Rs.{(data.totalCredit || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-1">Total Debit</p>
            <p className="text-xl font-bold text-green-600">Rs.{(data.totalDebit || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-1">Closing Balance</p>
            <p className={`text-xl font-bold ${(data.closingBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Rs.{(data.closingBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transactions</h3>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : !data?.entries?.length ? (
          <p className="text-center text-gray-500 py-8">No transactions found for this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Note</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Debit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Credit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {startDate && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="py-3 px-4 text-sm text-gray-500 italic" colSpan={5}>Opening Balance</td>
                    <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                      Rs.{(data.openingBalance || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
                {data.entries.map(entry => {
                  const tx = txConfig[entry.transactionType] || { label: entry.transactionType, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tx.color}`}>
                          {tx.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{entry.note || '-'}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        {entry.debit > 0
                          ? <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                              <ArrowDownCircle className="w-3 h-3" /> Rs.{entry.debit.toLocaleString()}
                            </span>
                          : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {entry.credit > 0
                          ? <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                              <ArrowUpCircle className="w-3 h-3" /> Rs.{entry.credit.toLocaleString()}
                            </span>
                          : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right">
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

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {partyType === 'customer' ? 'Payment received from customer' : 'Payment made to supplier'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rs.) *</label>
              <Input
                type="number" min="1"
                value={paymentForm.amount}
                onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
              <select
                value={paymentForm.paymentMode}
                onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <Input
                value={paymentForm.note}
                onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="Optional note"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={paymentLoading} className="bg-blue-600 hover:bg-blue-700">
                {paymentLoading ? 'Saving...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LedgerStatementPage;