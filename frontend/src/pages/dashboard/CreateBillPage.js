import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const CreateBillPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const searchMedicines = useCallback(async () => {
    try {
      const response = await api.get(`/medicine?search=${searchTerm}`);
      setMedicines(response.data);
    } catch (error) {
      toast.error("Failed to search medicines");
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchMedicines();
    } else {
      setMedicines([]);
    }
  }, [searchTerm, searchMedicines]);

  const addToCart = (medicine) => {
    const existingItem = cart.find((item) => item.medicineId === medicine._id);

    if (existingItem) {
      if (existingItem.quantity >= medicine.quantity) {
        toast.error("Insufficient stock");
        return;
      }
      setCart(
        cart.map((item) =>
          item.medicineId === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
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
      toast.error("Insufficient stock");
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.priceAtSale * item.quantity,
      0,
    );
    return Math.max(0, subtotal - discount);
  };

  // ── UPDATED: Professional pharmacy PDF ───────────────────────
  const generatePDF = (sale) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Read store info from localStorage
    const storedUser  = JSON.parse(localStorage.getItem("user") || "{}");
    const store       = storedUser?.store || {};
    const storeName   = store.name    || "Pharmacy";
    const storePhone  = store.phone   || "";
    const storeAddr   = store.address || "";
    const storeGST    = store.gstNumber || "";
    const invoiceNum  = `INV-${sale._id.slice(-8).toUpperCase()}`;

    // ── Header band ───────────────────────────────────────────
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, pageW, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text(storeName.toUpperCase(), pageW / 2, 14, { align: "center" });

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const headerLine2Parts = [storeAddr, storePhone].filter(Boolean).join("  |  ");
    if (headerLine2Parts) doc.text(headerLine2Parts, pageW / 2, 21, { align: "center" });
    if (storeGST)         doc.text(`GSTIN: ${storeGST}`, pageW / 2, 27, { align: "center" });

    // TAX INVOICE label
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(pageW / 2 - 22, 30, 44, 8, 2, 2, "F");
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("TAX INVOICE", pageW / 2, 35.5, { align: "center" });

    // ── Invoice meta box ──────────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    const saleDate = new Date(sale.date || sale.createdAt);
    const dateStr  = saleDate.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
    const timeStr  = saleDate.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit"
    });

    // Left col — invoice details
    doc.setFont(undefined, "bold");
    doc.text("Invoice No :", 14, 48);
    doc.text("Date       :", 14, 55);
    doc.text("Time       :", 14, 62);
    doc.text("Payment    :", 14, 69);

    doc.setFont(undefined, "normal");
    doc.text(invoiceNum,                          42, 48);
    doc.text(dateStr,                             42, 55);
    doc.text(timeStr,                             42, 62);
    doc.text(sale.paymentMode.toUpperCase(),      42, 69);

    // Right col — patient details
    doc.setFont(undefined, "bold");
    doc.text("Patient     :", pageW / 2 + 5, 48);
    doc.text("Mobile      :", pageW / 2 + 5, 55);

    doc.setFont(undefined, "normal");
    doc.text(sale.buyerName  || "Walk-in Customer", pageW / 2 + 30, 48);
    doc.text(sale.buyerPhone || "—",                pageW / 2 + 30, 55);

    // Divider
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(14, 74, pageW - 14, 74);

    // ── Medicine table ────────────────────────────────────────
    const tableData = sale.medicines.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      `Rs.${Number(item.priceAtSale).toFixed(2)}`,
      `Rs.${(item.priceAtSale * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 78,
      head: [["#", "Medicine Name", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [240, 247, 255],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "right",  cellWidth: 30 },
        4: { halign: "right",  cellWidth: 30 },
      },
    });

    const finalY = doc.lastAutoTable.finalY;

    // ── Totals block ──────────────────────────────────────────
    const subtotal = cart.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0);
    const discountAmt = sale.discount || 0;
    const total = sale.totalAmount;

    // Light background for totals
    doc.setFillColor(245, 250, 255);
    doc.rect(pageW / 2 + 10, finalY + 4, 76, discountAmt > 0 ? 26 : 18, "F");

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80, 80, 80);

    doc.text("Subtotal:",            pageW / 2 + 14, finalY + 12);
    doc.text(`Rs.${subtotal.toFixed(2)}`, pageW - 14, finalY + 12, { align: "right" });

    if (discountAmt > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text("Discount:",               pageW / 2 + 14, finalY + 19);
      doc.text(`- Rs.${discountAmt.toFixed(2)}`, pageW - 14, finalY + 19, { align: "right" });
    }

    // Total row
    const totalY = finalY + (discountAmt > 0 ? 30 : 22);
    doc.setFillColor(0, 102, 204);
    doc.rect(pageW / 2 + 10, totalY - 6, 76, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("TOTAL AMOUNT:", pageW / 2 + 14, totalY);
    doc.text(`Rs.${total.toFixed(2)}`, pageW - 14, totalY, { align: "right" });

    // Items count on left side
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Total Items: ${sale.medicines.length}`, 14, finalY + 12);
    doc.text(
      `Total Qty: ${sale.medicines.reduce((s, i) => s + i.quantity, 0)}`,
      14, finalY + 19
    );

    // ── Footer ────────────────────────────────────────────────
    const footerY = totalY + 18;

    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.3);
    doc.line(14, footerY, pageW - 14, footerY);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, "italic");
    doc.text(
      "Medicines once sold will not be taken back. Please check expiry date before purchase.",
      pageW / 2, footerY + 6, { align: "center" }
    );

    doc.setFont(undefined, "normal");
    doc.text(
      `Thank you for choosing ${storeName}. Get well soon!`,
      pageW / 2, footerY + 12, { align: "center" }
    );

    // Powered by watermark (very light)
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(7);
    doc.text("Generated by Pharmacy Management System", pageW / 2, 292, { align: "center" });

    doc.save(`${invoiceNum}.pdf`);
  };
  // ─────────────────────────────────────────────────────────────

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/sales", {
        medicines: cart,
        totalAmount: calculateTotal(),
        discount: discount || 0,
        paymentMode,
        buyerName,
        buyerPhone,
      });

      toast.success("Bill created successfully");
      generatePDF(response.data.sale);

      setCart([]);
      setDiscount(0);
      setSearchTerm("");
      setBuyerName("");
      setBuyerPhone("");
    } catch (error) {
      toast.error(error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="create-bill-page">
      <div>
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Create New Bill
        </h1>
        <p className="text-gray-600">Search medicines and generate invoice</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Search Medicines
            </h3>
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
                      <p className="font-medium text-gray-900">
                        {medicine.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Batch: {medicine.batchNumber} | Stock:{" "}
                        {medicine.quantity}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-blue-600">
                        ₹{medicine.sellingPrice}
                      </p>
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

          <div
            className="bg-white p-6 rounded-2xl shadow-lg"
            data-testid="cart-section"
          >
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
                      <p className="text-sm text-gray-600">
                        ₹{item.priceAtSale} each
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        min="1"
                        max={item.maxStock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.medicineId,
                            parseInt(e.target.value),
                          )
                        }
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
          <div
            className="bg-white p-6 rounded-2xl shadow-lg sticky top-6"
            data-testid="billing-summary"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Billing Summary
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name
                </label>
                <Input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Phone
                </label>
                <Input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (₹)
                </label>
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
                  ₹
                  {cart
                    .reduce(
                      (sum, item) => sum + item.priceAtSale * item.quantity,
                      0,
                    )
                    .toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-red-600">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCreateBill}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-6 text-lg"
              disabled={loading || cart.length === 0}
              data-testid="create-bill-button"
            >
              {loading ? "Creating..." : "Create Bill & Print"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBillPage;