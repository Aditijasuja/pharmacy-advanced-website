import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import api from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    gstNumber: "",
  });
  const [loading, setLoading] = useState(false);
const [editId, setEditId] = useState(null);
const [isEditMode, setIsEditMode] = useState(false);

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
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this supplier?"))
    return;

  try {
    await api.delete(`/supplier/${id}`);
    toast.success("Supplier deleted successfully");
    setSuppliers(suppliers.filter((s) => s._id !== id));
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to delete supplier");
  }
};
const handleEdit = (supplier) => {
  setFormData({
    name: supplier.name,
    phone: supplier.phone,
    address: supplier.address,
    
  });

  setEditId(supplier._id);
  setIsEditMode(true);
  setIsDialogOpen(true);
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (isEditMode) {
      await api.put(`/supplier/${editId}`, formData);
      toast.success("Supplier updated successfully");
    } else {
      await api.post("/supplier", formData);
      toast.success("Supplier added successfully");
    }

    setFormData({ name: "", phone: "", address: "", gstNumber: "" });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditId(null);
    fetchSuppliers();
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        (isEditMode ? "Failed to update supplier" : "Failed to add supplier")
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6" data-testid="suppliers-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Suppliers
          </h1>
          <p className="text-gray-600">Manage your medicine suppliers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="add-supplier-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
  {isEditMode ? "Edit Supplier" : "Add New Supplier"}
</DialogTitle>

              <DialogDescription>
                Add a new medicine supplier to your database
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  data-testid="supplier-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  data-testid="supplier-phone-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  data-testid="supplier-address-input"
                />
              </div>

             

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="supplier-submit-button"
                >
                 {loading
  ? isEditMode
    ? "Updating..."
    : "Adding..."
  : isEditMode
  ? "Update Supplier"
  : "Add Supplier"}

                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {suppliers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No suppliers found</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add First Supplier
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier._id}
                className="border border-gray-200 rounded-xl p-6 hover-lift"
                data-testid={`supplier-card-${supplier._id}`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {supplier.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="text-gray-900 font-medium">
                      {supplier.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="text-gray-900">{supplier.address}</p>
                  </div>
                  {supplier.gstNumber && (
                    <div>
                      <span className="text-gray-600">GST:</span>
                      <p className="text-gray-900">{supplier.gstNumber}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="text-xs text-gray-500">
                      Added: {new Date(supplier.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 mt-4">
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleEdit(supplier)}
  >
    Edit
  </Button>

  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleDelete(supplier._id)}
  >
    Delete
  </Button>
</div>

                  </div>
                  
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
