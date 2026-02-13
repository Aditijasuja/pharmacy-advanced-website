import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const CreateBillPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchMedicines();
    } else {
      setMedicines([]);
    }
  }, [searchTerm]);

  const searchMedicines = async () => {
    try {
      const response = await api.get(`/medicine?search=${searchTerm}`);
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to search medicines');
    }
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find((item) => item.medicineId === medicine._id);

    if (existingItem) {
      if (existingItem.quantity >= medicine.quantity) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.medicineId === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine._id,
          name: medicine.name,
          priceAtSale: medicine.sellingPrice,
          quantity: 1,
          maxStock: medicine.quantity,
        },
      ]);
    }
    toast.success(`${medicine.name} added to cart`);
  };

  const updateQuantity = (medicineId, newQuantity) => {
    const item = cart.find((i) => i.medicineId === medicineId);
    if (newQuantity > item.maxStock) {
      toast.error('Insufficient stock');
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.priceAtSale * item.quantity,
      0
    );
    return Math.max(0, subtotal - discount);
  };

  const generatePDF = (sale) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('G.K. Medicos', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Fazilka, Punjab - 152123', 105, 22, { align: 'center' });
    doc.text('Phone: +91 98765-43210', 105, 28, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(12);
    doc.text(`Invoice #${sale._id.slice(-8).toUpperCase()}`, 20, 40);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`, 20, 47);
    doc.text(`Payment: ${sale.paymentMode.toUpperCase()}`, 20, 54);

    const tableData = sale.medicines.map((item) => [
      item.name,
      item.quantity,
      `₹${item.priceAtSale.toFixed(2)}`,
      `₹${(item.priceAtSale * item.quantity).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 60,
      head: [['Medicine', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Subtotal: ₹${(sale.totalAmount + sale.discount).toFixed(2)}`, 140, finalY);
    if (sale.discount > 0) {
      doc.text(`Discount: -₹${sale.discount.toFixed(2)}`, 140, finalY + 7);
    }
    doc.setFontSize(14);
    doc.text(`Total: ₹${sale.totalAmount.toFixed(2)}`, 140, finalY + 14);

    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', 105, finalY + 30, { align: 'center' });

    doc.save(`invoice-${sale._id}.pdf`);
  };

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/sales', {
        medicines: cart,
        totalAmount: calculateTotal(),
        discount: discount || 0,
        paymentMode,
      });

      toast.success('Bill created successfully');
      generatePDF(response.data.sale);

      setCart([]);
      setDiscount(0);
      setSearchTerm('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="create-bill-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Create New Bill
        </h1>
        <p className="text-gray-600">Search medicines and generate invoice</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Search Medicines</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Type medicine name or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-medicine-input"
              />
            </div>

            {searchTerm.length >= 2 && medicines.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {medicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    data-testid={`medicine-item-${medicine._id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">
                        Batch: {medicine.batchNumber} | Stock: {medicine.quantity}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-blue-600">₹{medicine.sellingPrice}</p>
                    </div>
                    <Button
                      onClick={() => addToCart(medicine)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid={`add-to-cart-${medicine._id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg" data-testid="cart-section">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cart Items</h3>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.medicineId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    data-testid={`cart-item-${item.medicineId}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.priceAtSale} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        min="1"
                        max={item.maxStock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value))}
                        className="w-20"
                        data-testid={`quantity-input-${item.medicineId}`}
                      />
                      <p className="font-bold text-gray-900 w-24 text-right">
                        ₹{(item.priceAtSale * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`remove-item-${item.medicineId}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6" data-testid="billing-summary">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Billing Summary</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger data-testid="payment-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  data-testid="discount-input"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  ₹{cart.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-red-600">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCreateBill}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-6 text-lg"
              disabled={loading || cart.length === 0}
              data-testid="create-bill-button"
            >
              {loading ? 'Creating Bill...' : 'Create Bill & Print'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBillPage;