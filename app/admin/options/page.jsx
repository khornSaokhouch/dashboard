// File: components/OptionGroupsUI.jsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useOptionStore } from "../../stores/useOptionStore";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";

export default function OptionGroupsUI() {
  const {
    options = [],
    loading,
    error,
    fetchOptions,
    updateOptionP,
    deleteOption: storeDeleteOption,
  } = useOptionStore();

  const {
    fetchGroups: fetchStoreGroups,
    options: groupOptions = [],
    createOptions,
  } = useItemOptionStore();

  // Create form state
  const [newOption, setNewOption] = useState({
    item_option_group_id: "",
    name: "",
    price_adjust_cents: 0,
    icon: null,
    is_active: true,
  });

  // Edit state
  const [editOption, setEditOption] = useState(null);

  // Groups fallback
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Previews
  const [previewSrc, setPreviewSrc] = useState(null);
  const [editPreviewSrc, setEditPreviewSrc] = useState(null);

  // Refs to revoke object URLs
  const lastPreviewRef = useRef(null);
  const lastEditPreviewRef = useRef(null);

  // UX state for toggling active per id
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    // Load initial options and groups
    fetchOptions?.().catch(console.error);
    fetchStoreGroups?.().catch(console.error);

    // Cleanup on unmount
    return () => {
      revokePreview();
      revokeEditPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetNew = () =>
    setNewOption({
      item_option_group_id: "",
      name: "",
      price_adjust_cents: 0,
      icon: null,
    });

  // ---------------- CREATE ----------------
  const handleCreate = async (e) => {
    e?.preventDefault();

    if (!newOption.item_option_group_id) return alert("Select a group.");
    if (!newOption.name?.trim()) return alert("Name is required.");

    const fd = new FormData();
    fd.append("item_option_group_id", newOption.item_option_group_id);
    fd.append("name", newOption.name.trim());
    fd.append("price_adjust_cents", String(Number(newOption.price_adjust_cents)));
    fd.append("is_active", newOption.is_active ? "1" : "0");

    if (newOption.icon instanceof File) fd.append("icon", newOption.icon);

    try {
      await createOptions(fd);
      await fetchOptions();
      resetNew();
      revokePreview();
      setPreviewSrc(null);
      alert("Option created successfully.");
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create option: " + (err?.message ?? err));
    }
  };

  // ---------------- START EDIT ----------------
  // Semantics: editOption.icon -> undefined = keep, File = new upload, null = remove
  const handleStartEdit = (opt) => {
    revokeEditPreview();

    setEditOption({
      id: opt.id,
      item_option_group_id: opt.item_option_group_id ?? "",
      name: opt.name ?? "",
      price_adjust_cents: opt.price_adjust_cents ?? 0,
      icon: undefined, // undefined = keep current icon unless user acts
    });

    setEditPreviewSrc(opt.icon ?? null);
  };

  // ---------------- UPDATE ----------------
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!editOption) return;
    if (!editOption.item_option_group_id) return alert("Select a group.");
    if (!editOption.name?.trim()) return alert("Name is required.");

    const fd = new FormData();
    fd.append("item_option_group_id", editOption.item_option_group_id);
    fd.append("name", editOption.name.trim());
    fd.append("price_adjust_cents", String(Number(editOption.price_adjust_cents)));
    fd.append("is_active", "1");

    // icon handling
    if (editOption.icon instanceof File) {
      fd.append("icon", editOption.icon);
    } else if (editOption.icon === null) {
      fd.append("remove_icon", "1");
    }

    try {
       await updateOptionP(editOption.id, fd);

      await fetchOptions();
      setEditOption(null);
      revokeEditPreview();
      setEditPreviewSrc(null);
      alert("Option updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
      alert(
        err?.response?.data?.message || err?.message || "Failed to update option."
      );
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this option?")) return;
    try {
      const ok = await storeDeleteOption(id);
      if (ok) {
        await fetchOptions();
        alert("Option deleted successfully.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete: " + (err?.message ?? err));
    }
  };

  // ---------------- TOGGLE ACTIVE ----------------
  const handleToggleActive = async (opt) => {
    if (!opt) return;
    const newVal = opt.is_active ? 0 : 1; // toggle
    if (!confirm(`Are you sure you want to ${newVal ? "activate" : "deactivate"} "${opt.name}"?`)) return;

    try {
      setTogglingId(opt.id);
      const fd = new FormData();
      fd.append("is_active", String(newVal));

      await updateOptionP(opt.id, fd);
    
      await fetchOptions();
      alert(`${opt.name} ${newVal ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error("Toggle active error:", err);
      alert(err?.response?.data?.message || err?.message || "Failed to toggle active state.");
    } finally {
      setTogglingId(null);
    }
  };

  // ---------------- FILE HANDLERS ----------------
  const handleIconChange = (file) => {
    if (!file) {
      setNewOption((s) => ({ ...s, icon: null }));
      revokePreview();
      setPreviewSrc(null);
      return;
    }
    setNewOption((s) => ({ ...s, icon: file }));
    const url = URL.createObjectURL(file);
    revokePreview();
    lastPreviewRef.current = url;
    setPreviewSrc(url);
  };

  const handleEditIconChange = (file) => {
    // file === null means user cleared the input and wants to remove the icon
    setEditOption((s) => ({ ...s, icon: file ?? null }));
    const url = file ? URL.createObjectURL(file) : null;
    revokeEditPreview();
    lastEditPreviewRef.current = url;
    setEditPreviewSrc(url);
  };

  const revokePreview = () => {
    if (lastPreviewRef.current) {
      try {
        URL.revokeObjectURL(lastPreviewRef.current);
      } catch {}
      lastPreviewRef.current = null;
    }
  };

  const revokeEditPreview = () => {
    if (lastEditPreviewRef.current) {
      try {
        URL.revokeObjectURL(lastEditPreviewRef.current);
      } catch {}
      lastEditPreviewRef.current = null;
    }
  };

  const fmtPrice = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

  const selectGroups =
    groupOptions.length > 0 ? groupOptions : groups;

  // ---------------- RENDER ----------------
  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "auto" }}>
      <h2>Option Groups</h2>
      {(loading || groupsLoading) && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {String(error)}</p>}

      {/* Table */}
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th>ID</th>
              <th>Group</th>
              <th>Name</th>
              <th>Price</th>
              <th>Icon</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                  No options found.
                </td>
              </tr>
            )}
            {options.map((opt) => (
              <tr key={opt.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{opt.id}</td>
                <td>{opt.group?.name ?? "—"}</td>
                <td>{opt.name}</td>
                <td>{fmtPrice(opt.price_adjust_cents)}</td>
                <td>
                  {opt.icon ? (
                    <Image
                      src={opt.icon}
                      alt="icon"
                      width={40}
                      height={40}
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{opt.created_at ? new Date(opt.created_at).toLocaleString() : "—"}</td>
                <td>{opt.updated_at ? new Date(opt.updated_at).toLocaleString() : "—"}</td>
                <td>
                  <button onClick={() => handleStartEdit(opt)} style={{ marginRight: 8 }}>
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleActive(opt)}
                    disabled={togglingId === opt.id}
                    style={{
                      marginRight: 8,
                      background: opt.is_active ? "#f39c12" : "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 8px",
                      opacity: togglingId === opt.id ? 0.7 : 1,
                    }}
                    title={opt.is_active ? "Deactivate option" : "Activate option"}
                  >
                    {togglingId === opt.id ? (opt.is_active ? "Deactivating..." : "Activating...") : (opt.is_active ? "Deactivate" : "Activate")}
                  </button>

                  <button
                    onClick={() => handleDelete(opt.id)}
                    style={{ background: "#e55353", color: "white", border: "none", borderRadius: 4, padding: "6px 8px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE FORM */}
      <div style={{ marginBottom: 28 }}>
        <h3>Add New Option</h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 8, maxWidth: 560 }}>
          <label>
            Group
            <br />
            <select
              value={newOption.item_option_group_id}
              onChange={(e) =>
                setNewOption((s) => ({ ...s, item_option_group_id: e.target.value }))
              }
              required
            >
              <option value="">Select a group</option>
              {selectGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name ?? "Unnamed"}</option>
              ))}
            </select>
          </label>

          <label>
            Name
            <input
              value={newOption.name}
              onChange={(e) => setNewOption((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </label>

          <label>
            Price Adjust (cents)
            <input
              type="number"
              min={0}
              value={newOption.price_adjust_cents}
              onChange={(e) => setNewOption((s) => ({ ...s, price_adjust_cents: Number(e.target.value) }))}
            />
          </label>

          <label>
            Icon
            <input type="file" accept="image/*" onChange={(e) => handleIconChange(e.target.files?.[0] ?? null)} />
          </label>

          {previewSrc && <Image src={previewSrc} alt="preview" width={80} height={80} unoptimized />}

          <button type="submit">Add Option</button>
        </form>
      </div>

      {/* EDIT FORM */}
      {editOption && (
        <div style={{ marginBottom: 20 }}>
          <h3>Edit Option #{editOption.id}</h3>
          <form onSubmit={handleUpdate} style={{ display: "grid", gap: 8, maxWidth: 560 }}>
            <label>
              Group
              <select
                value={editOption.item_option_group_id}
                onChange={(e) =>
                  setEditOption((s) => ({ ...s, item_option_group_id: e.target.value }))
                }
                required
              >
                <option value="">Select a group</option>
                {selectGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name ?? "Unnamed"}</option>
                ))}
              </select>
            </label>

            <label>
              Name
              <input
                value={editOption.name}
                onChange={(e) => setEditOption((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </label>

            <label>
              Price Adjust (cents)
              <input
                type="number"
                min={0}
                value={editOption.price_adjust_cents}
                onChange={(e) => setEditOption((s) => ({ ...s, price_adjust_cents: Number(e.target.value) }))}
              />
            </label>

            <label>
              Replace Icon
              <input type="file" accept="image/*" onChange={(e) => handleEditIconChange(e.target.files?.[0] ?? null)} />
            </label>

            {editPreviewSrc && <Image src={editPreviewSrc} alt="edit-preview" width={80} height={80} unoptimized />}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => { setEditOption(null); revokeEditPreview(); setEditPreviewSrc(null); }}>Cancel</button>
              {/* Quick Remove Icon button */}
              <button type="button" onClick={() => { setEditOption((s) => ({ ...s, icon: null })); revokeEditPreview(); setEditPreviewSrc(null); }} style={{ background: '#d9534f', color: 'white', border: 'none', borderRadius: 4, padding: '6px 8px' }}>
                Remove Icon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


