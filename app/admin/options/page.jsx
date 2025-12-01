"use client";

import React, { useEffect, useState } from "react";
import { useOptionStore } from "../../stores/useOptionStore";

export default function OptionGroupsUI() {
  const {
    options,
    loading,
    error,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption,
  } = useOptionStore();

  const [newOption, setNewOption] = useState({
    name: "",
    type: "",
    is_required: false,
  });

  const [editOption, setEditOption] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  

  const handleCreate = async () => {
    if (!newOption.name) return alert("Name is required");
    if (!newOption.type) return alert("Please select a type");

    const result = await createOption(newOption);
    if (result) {
      alert("Option group created successfully!");
      setNewOption({ name: "", type: "", is_required: false });
    }
  };

  const handleUpdate = async () => {
    if (!editOption.name) return alert("Name is required");
    if (!editOption.type) return alert("Please select a type");

    const result = await updateOption(editOption.id, editOption);
    if (result) {
      alert("Option group updated successfully!");
      setEditOption(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this option group?")) {
      await deleteOption(id);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2>Option Groups</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt) => (
            <tr key={opt.id}>
              {editOption?.id === opt.id ? (
                <>
                  <td>{opt.id}</td>
                  <td>
                    <input
                      value={editOption.name}
                      onChange={(e) => setEditOption({ ...editOption, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      value={editOption.type}
                      onChange={(e) => setEditOption({ ...editOption, type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="single">Select</option>
                      <option value="multiple">Multiple</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={editOption.is_required}
                      onChange={(e) => setEditOption({ ...editOption, is_required: e.target.checked })}
                    />
                  </td>
                  <td>
                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setEditOption(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{opt.id}</td>
                  <td>{opt.name}</td>
                  <td>{opt.type}</td>
                  <td>{opt.is_required ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => setEditOption(opt)}>Edit</button>
                    <button onClick={() => handleDelete(opt.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "20px" }}>Add New Option Group</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
        <input
          placeholder="Name"
          value={newOption.name}
          onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
        />
        <select
          value={newOption.type}
          onChange={(e) => setNewOption({ ...newOption, type: e.target.value })}
        >
          <option value="">Select Type</option>
          <option value="single">Single</option>
          <option value="multiple">Multiple</option>
        </select>
        <label>
          Required
          <input
            type="checkbox"
            checked={newOption.is_required}
            onChange={(e) => setNewOption({ ...newOption, is_required: e.target.checked })}
            style={{ marginLeft: "5px" }}
          />
        </label>
        <button onClick={handleCreate} style={{ marginTop: "10px" }}>
          Add Option Group
        </button>
      </div>
    </div>
  );
}
