"use client";

import { useEffect, useState } from "react";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";

export default function ItemOptionGroups() {
  const {
    options = [],
    fetchOptions,
    loading,
    error,
    createOption,
    updateOption,
    deleteOption,
  } = useItemOptionStore();

  // New option form state (matches the JSON shape you requested)
  const [newOption, setNewOption] = useState({
    name: "",
    type: "select", // default
    is_required: false,
  });

  // Editing state (null when not editing)
  const [editingOption, setEditingOption] = useState(null);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        await fetchOptions();
      } catch (e) {
        console.error("Failed to fetch options:", e);
      }
    })();
    // fetchOptions is stable in most Zustand patterns; keep it in deps to avoid warnings
  }, [fetchOptions]);

  // Add a new option (sends only the shape { name, type, is_required })
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newOption.name.trim(),
        type: newOption.type,
        is_required: Boolean(newOption.is_required),
      };

      if (!payload.name) {
        alert("Name is required.");
        return;
      }

      await createOption(payload);
      // reset form
      setNewOption({ name: "", type: "select", is_required: false });
      // refresh list
      await fetchOptions();
    } catch (err) {
      console.error("Failed to create option:", err);
      alert("Failed to create option.");
    }
  };

  // Start editing an option (make a shallow copy so we don't mutate store directly)
  const handleEdit = (option) => {
    setEditingOption({
      id: option.id,
      name: option.name ?? "",
      type: option.type ?? "select",
      is_required: Boolean(option.is_required),
    });
  };

  // Update an existing option
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingOption) return;

    try {
      const payload = {
        name: editingOption.name.trim(),
        type: editingOption.type,
        is_required: Boolean(editingOption.is_required),
      };

      if (!payload.name) {
        alert("Name is required.");
        return;
      }

      await updateOption(editingOption.id, payload);
      setEditingOption(null);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to update option:", err);
      alert("Failed to update option.");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this option?")) return;
    try {
      await deleteOption(id);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to delete option:", err);
      alert("Failed to delete option.");
    }
  };

  // Helper: safe formatters
  const fmtDate = (val) => (val ? new Date(val).toLocaleString() : "N/A");
  const fmtPriceCents = (cents) => {
    const n = Number(cents ?? 0);
    return (n / 100).toFixed(2);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Item Option Groups</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {String(error)}</p>}

      {/* Add / Update Form */}
      <form
        onSubmit={editingOption ? handleUpdate : handleAdd}
        className="mb-6 flex flex-wrap gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Name (e.g. Sugar Level)"
          value={editingOption ? editingOption.name : newOption.name}
          onChange={(e) =>
            editingOption
              ? setEditingOption({ ...editingOption, name: e.target.value })
              : setNewOption({ ...newOption, name: e.target.value })
          }
          className="border px-2 py-1 rounded"
          required
        />

        <select
          value={editingOption ? editingOption.type : newOption.type}
          onChange={(e) =>
            editingOption
              ? setEditingOption({ ...editingOption, type: e.target.value })
              : setNewOption({ ...newOption, type: e.target.value })
          }
          className="border px-2 py-1 rounded"
        >
          <option value="select">select</option>
          <option value="checkbox">checkbox</option>
          <option value="radio">radio</option>
          <option value="text">text</option>
          {/* Add other types you support */}
        </select>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={editingOption ? editingOption.is_required : newOption.is_required}
            onChange={(e) =>
              editingOption
                ? setEditingOption({ ...editingOption, is_required: e.target.checked })
                : setNewOption({ ...newOption, is_required: e.target.checked })
            }
          />
          Required
        </label>

        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
          {editingOption ? "Update" : "Add"}
        </button>

        {editingOption && (
          <button
            type="button"
            className="bg-gray-300 text-black px-3 py-1 rounded"
            onClick={() => setEditingOption(null)}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Options Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Required</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!options || options.length === 0) && !loading && (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No options found.
                </td>
              </tr>
            )}

            {options.map((option) => (
              <tr key={option.id} className="border-t border-gray-200">
                <td className="px-4 py-2">{option.id}</td>
                <td className="px-4 py-2">{option.name}</td>
                <td className="px-4 py-2">{option.type ?? "N/A"}</td>
                <td className="px-4 py-2">{option.is_required ? "Yes" : "No"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(option)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(option.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
