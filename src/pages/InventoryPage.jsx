import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";

import {
  listenToInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryService";

import "../styles/InventoryPage.css";

function InventoryPage() {
  const [organizationId, setOrganizationId] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unitPrice: "",
    minimumStock: "",
  });

  // ============================================================
  // LOAD ADMIN ORGANIZATION
  // ============================================================

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          toast.error("Please log in again.");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          toast.error("User profile not found.");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        if (!userData.organizationId) {
          toast.error("You are not connected to an organization.");
          setLoading(false);
          return;
        }

        setOrganizationId(userData.organizationId);
      } catch (error) {
        console.error("Error loading organization:", error);
        toast.error("Unable to load organization.");
        setLoading(false);
      }
    };

    loadOrganization();
  }, []);

  // ============================================================
  // REAL-TIME INVENTORY LISTENER
  // ============================================================

  useEffect(() => {
    if (!organizationId) return;

    setLoading(true);

    const unsubscribe = listenToInventory({
      organizationId,
      callback: (inventoryItems) => {
        setItems(inventoryItems);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [organizationId]);

  // ============================================================
  // FORM HANDLING
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      quantity: "",
      unitPrice: "",
      minimumStock: "",
    });

    setEditingId(null);
  };

  // ============================================================
  // ADD / UPDATE ITEM
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!organizationId) {
      toast.error("Organization not found.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Enter the inventory item name.");
      return;
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    if (form.unitPrice === "" || Number(form.unitPrice) < 0) {
      toast.error("Enter a valid unit price.");
      return;
    }

    if (
      form.minimumStock === "" ||
      Number(form.minimumStock) < 0
    ) {
      toast.error("Enter a valid minimum stock.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateInventoryItem({
          organizationId,
          itemId: editingId,
          name: form.name,
          category: form.category,
          quantity: form.quantity,
          unitPrice: form.unitPrice,
          minimumStock: form.minimumStock,
        });

        toast.success("Inventory item updated.");
      } else {
        await addInventoryItem({
          organizationId,
          name: form.name,
          category: form.category,
          quantity: form.quantity,
          unitPrice: form.unitPrice,
          minimumStock: form.minimumStock,
        });

        toast.success("Inventory item added.");
      }

      resetForm();
    } catch (error) {
      console.error("Inventory save error:", error);

      toast.error(
        error.message || "Unable to save inventory item."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT ITEM
  // ============================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity: String(item.quantity ?? ""),
      unitPrice: String(item.unitPrice ?? ""),
      minimumStock: String(item.minimumStock ?? ""),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE ITEM
  // ============================================================

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (!confirmed) return;

    try {
      await deleteInventoryItem({
        organizationId,
        itemId,
      });

      toast.success("Inventory item deleted.");
    } catch (error) {
      console.error("Inventory delete error:", error);

      toast.error(
        error.message || "Unable to delete inventory item."
      );
    }
  };

  // ============================================================
  // INVENTORY STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const totalItems = items.length;

    const totalQuantity = items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

    const totalValue = items.reduce(
      (total, item) =>
        total + Number(item.totalValue || 0),
      0
    );

    const lowStock = items.filter(
      (item) =>
        Number(item.quantity || 0) <=
        Number(item.minimumStock || 0)
    ).length;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStock,
    };
  }, [items]);

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (value) => {
    return `₦${Number(value || 0).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="inventory-loading">
          <div className="inventory-spinner"></div>

          <h3>Loading Inventory...</h3>

          <p>
            Please wait while your cooperative inventory loads.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="inventory-page">

      {/* HEADER */}

      <div className="inventory-header">

        <div>
          <span className="inventory-label">
            AGRICULTURAL COOPERATIVE
          </span>

          <h1>📦 Inventory Management</h1>

          <p>
            Manage farm inputs, equipment, stock levels,
            and inventory value in one place.
          </p>
        </div>

        <div className="inventory-header-badge">
          ADMIN
        </div>

      </div>

      {/* STATISTICS */}

      <div className="inventory-stat-grid">

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon">
            📦
          </div>

          <div>
            <span>Total Items</span>
            <strong>{statistics.totalItems}</strong>
          </div>

        </div>

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon">
            🔢
          </div>

          <div>
            <span>Total Quantity</span>
            <strong>{statistics.totalQuantity}</strong>
          </div>

        </div>

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon">
            💰
          </div>

          <div>
            <span>Inventory Value</span>
            <strong>
              {formatMoney(statistics.totalValue)}
            </strong>
          </div>

        </div>

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon warning">
            ⚠️
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{statistics.lowStock}</strong>
          </div>

        </div>

      </div>

      {/* ADD / EDIT FORM */}

      <div className="inventory-form-card">

        <div className="inventory-card-heading">

          <div>
            <h2>
              {editingId
                ? "Edit Inventory Item"
                : "Add Inventory Item"}
            </h2>

            <p>
              {editingId
                ? "Update the information for this inventory item."
                : "Add a new farm input, equipment, or cooperative stock item."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="inventory-cancel-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form onSubmit={handleSubmit}>

          <div className="inventory-form-grid">

            <div className="inventory-form-group">

              <label htmlFor="name">
                Item Name
              </label>

              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Fertilizer"
              />

            </div>

            <div className="inventory-form-group">

              <label htmlFor="category">
                Category
              </label>

              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Farm Inputs"
              />

            </div>

            <div className="inventory-form-group">

              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
              />

            </div>

            <div className="inventory-form-group">

              <label htmlFor="unitPrice">
                Unit Price
              </label>

              <div className="inventory-money-input">

                <span>₦</span>

                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  value={form.unitPrice}
                  onChange={handleChange}
                  placeholder="0"
                />

              </div>

            </div>

            <div className="inventory-form-group">

              <label htmlFor="minimumStock">
                Minimum Stock
              </label>

              <input
                id="minimumStock"
                name="minimumStock"
                type="number"
                min="0"
                value={form.minimumStock}
                onChange={handleChange}
                placeholder="e.g. 10"
              />

            </div>

          </div>

          <button
            type="submit"
            className="inventory-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Item"
              : "Add Item"}
          </button>

        </form>

      </div>

      {/* INVENTORY TABLE */}

      <div className="inventory-list-card">

        <div className="inventory-list-header">

          <div>
            <h2>Inventory Items</h2>

            <p>
              All inventory belonging to your cooperative.
            </p>
          </div>

          <span className="inventory-count">
            {items.length}{" "}
            {items.length === 1
              ? "Item"
              : "Items"}
          </span>

        </div>

        {items.length === 0 ? (

          <div className="inventory-empty">

            <div className="inventory-empty-icon">
              📦
            </div>

            <h3>No Inventory Items</h3>

            <p>
              Add your first inventory item above.
            </p>

          </div>

        ) : (

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {items.map((item) => {

                  const quantity =
                    Number(item.quantity || 0);

                  const minimumStock =
                    Number(item.minimumStock || 0);

                  const isLowStock =
                    quantity <= minimumStock;

                  return (
                    <tr key={item.id}>

                      <td>
                        <strong className="inventory-item-name">
                          {item.name}
                        </strong>
                      </td>

                      <td>
                        {item.category || "General"}
                      </td>

                      <td>
                        <strong>
                          {quantity}
                        </strong>
                      </td>

                      <td>
                        {formatMoney(item.unitPrice)}
                      </td>

                      <td>
                        <strong className="inventory-value">
                          {formatMoney(item.totalValue)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={
                            isLowStock
                              ? "inventory-status low"
                              : "inventory-status good"
                          }
                        >
                          {isLowStock
                            ? "⚠️ Low Stock"
                            : "✓ In Stock"}
                        </span>

                      </td>

                      <td>

                        <div className="inventory-actions">

                          <button
                            type="button"
                            className="inventory-edit-button"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="inventory-delete-button"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default InventoryPage;