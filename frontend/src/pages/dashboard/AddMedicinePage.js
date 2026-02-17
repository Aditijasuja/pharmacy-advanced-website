import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
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

const AddMedicinePage = () => {
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
    supplierId: "",
    lowStockThreshold: "10",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/supplier");
      setSuppliers(response.data);
    } catch (error) {
      toast.error("Failed to load suppliers");
    }
  };

const fetchMedicineById = useCallback(async () => {
  try {
    const response = await api.get(`/medicine/${id}`);
    const medicine = response.data;

    setFormData({
      ...medicine,
      expiryDate: medicine.expiryDate
        ? new Date(medicine.expiryDate).toISOString().split("T")[0]
        : "",
    });
  } catch (error) {
    toast.error("Failed to load medicine");
  }
}, [id]);

  useEffect(() => {
    if (id) {
      fetchMedicineById();
    }
  }, [id, fetchMedicineById]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (id) {
      await api.put(`/medicine/${id}`, formData);
      toast.success("Medicine updated successfully");
    } else {
      await api.post("/medicine", formData);
      toast.success("Medicine added successfully");
    }

  } catch (error) {
    toast.error("Failed to save medicine");
  }
};


  return (
    <div className="max-w-4xl" data-testid="add-medicine-page">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Add New Medicine
        </h1>
        <p className="text-gray-600">Add medicine to your inventory</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="medicine-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Antibiotic, Painkiller"
                required
                data-testid="medicine-category-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number *
              </label>
              <Input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                data-testid="medicine-batch-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <Input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                data-testid="medicine-expiry-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
                data-testid="medicine-quantity-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <Input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
                data-testid="medicine-threshold-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price (₹) *
              </label>
              <Input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                data-testid="medicine-purchase-price-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <Input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                data-testid="medicine-selling-price-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplierId: value })
                }
              >
                <SelectTrigger data-testid="medicine-supplier-select">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {suppliers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No suppliers available. Please add a supplier first.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || suppliers.length === 0}
              data-testid="add-medicine-submit-button"
            >
              {loading ? "Adding Medicine..." : "Add Medicine"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/medicines")}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicinePage;
