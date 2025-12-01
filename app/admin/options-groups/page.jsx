"use client";

import { useEffect, useState } from "react";
import { useItemOptionStore } from "../../stores/useItemoptionStore";

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

const [newOption, setNewOption] = useState({
name: "",
type: "select", // default type
is_required: false,
});

const [editingOption, setEditingOption] = useState(null);

useEffect(() => {
fetchOptions();
}, [fetchOptions]);

// -----------------------------
// Handlers
// -----------------------------
const handleAdd = async (e) => {
e.preventDefault();
await createOption({ ...newOption, item_option_group_id: 1 }); // group_id 1
setNewOption({ name: "", type: "select", is_required: false });
};

const handleEdit = (option) => {
setEditingOption(option);
};

const handleUpdate = async (e) => {
e.preventDefault();
if (editingOption) {
await updateOption(editingOption.id, editingOption);
setEditingOption(null);
}
};

const handleDelete = async (id) => {
if (confirm("Are you sure you want to delete this option?")) {
await deleteOption(id);
}
};

return ( <div className="p-6"> <h1 className="text-2xl font-bold mb-4">Item Option Groups</h1>

  {loading && <p className="text-gray-500">Loading...</p>}
  {error && <p className="text-red-500">{error}</p>}

  {/* -----------------------------
      Add / Update Form
  ----------------------------- */}
  <form
    onSubmit={editingOption ? handleUpdate : handleAdd}
    className="mb-6 flex gap-2 items-center"
  >
    <input
      type="text"
      placeholder="Name"
      value={editingOption ? editingOption.name : newOption.name}
      onChange={(e) =>
        editingOption
          ? setEditingOption({ ...editingOption, name: e.target.value })
          : setNewOption({ ...newOption, name: e.target.value })
      }
      className="border px-2 py-1 rounded"
      required
    />
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
    <button
      type="submit"
      className="bg-blue-500 text-white px-3 py-1 rounded"
    >
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

  {/* -----------------------------
      Options Table
  ----------------------------- */}
  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 text-left">ID</th>
        <th className="px-4 py-2 text-left">Name</th>
        <th className="px-4 py-2 text-left">Group</th>
        <th className="px-4 py-2 text-left">Required</th>
        <th className="px-4 py-2 text-left">Price</th>
        <th className="px-4 py-2 text-left">Created At</th>
        <th className="px-4 py-2 text-left">Updated At</th>
        <th className="px-4 py-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {options.length === 0 && !loading && (
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
          <td className="px-4 py-2">{option.group?.name || "N/A"}</td>
          <td className="px-4 py-2">{option.is_required ? "Yes" : "No"}</td>
          <td className="px-4 py-2">{Number(option.price_adjust_cents / 100).toFixed(2)}</td>
          <td className="px-4 py-2">{new Date(option.created_at).toLocaleString()}</td>
          <td className="px-4 py-2">{new Date(option.updated_at).toLocaleString()}</td>
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

);
}
