"use client";

import React, { useEffect, useState } from "react";
import { useOptionStore } from "../../stores/useOptionStore";
import Image from "next/image";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";

export default function OptionGroupsUI() {
  const {
    options = [],
    loading,
    error,
    fetchOptions,
    
    // If you prefer store actions for create/update/delete, you can still call them
    createOption: storeCreateOption,
    updateOption: storeUpdateOption,
    deleteOption: storeDeleteOption,
  } = useOptionStore();

  const {fetchGroups,options:groupOptions} = useItemOptionStore();

  // form for creating new option (fields required by backend)
  const [newOption, setNewOption] = useState({
    item_option_group_id: "", // SELECT
    name: "",
    price_adjust_cents: 0,
    icon: null, // File
  });

  // editing state
  const [editOption, setEditOption] = useState(null);

  // item option groups for the select dropdown
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // preview for icon
  const [previewSrc, setPreviewSrc] = useState(null);
  const [editPreviewSrc, setEditPreviewSrc] = useState(null);

  useEffect(() => {
    // load options list from store
    fetchOptions().catch((e) => console.error("fetchOptions error:", e));
    // load groups for the select
    loadGroups();
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  

  const loadGroups = async () => {
    setGroupsLoading(true);
    try {
      // adjust the endpoint to your app's route for listing item_option_groups
      const res = await fetch("/api/item-option-groups");
      if (!res.ok) throw new Error(`Failed to load groups (${res.status})`);
      const data = await res.json();
      // expected: [{ id, name }, ...]
      setGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load item option groups:", e);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  // utility: reset create form
  const resetNew = () =>
    setNewOption({
      item_option_group_id: "",
      name: "",
      price_adjust_cents: 0,
      icon: null,
    });

  // create using multipart/form-data -> POST /api/item-options
  const handleCreate = async (e) => {
    e?.preventDefault();

    // validation
    if (!newOption.item_option_group_id) return alert("Please select an Item Option Group.");
    if (!newOption.name || !newOption.name.trim()) return alert("Name is required.");

    // Build FormData
    const fd = new FormData();
    fd.append("item_option_group_id", newOption.item_option_group_id);
    fd.append("name", newOption.name.trim());
    // backend expects price_adjust_cents as numeric (cents)
    const cents = Number(newOption.price_adjust_cents) || 0;
    fd.append("price_adjust_cents", String(cents));
    if (newOption.icon instanceof File) {
      fd.append("icon", newOption.icon);
    }

    try {
      // Option A: use store action if it accepts FormData
      if (typeof storeCreateOption === "function") {
        // try store first — many stores expect plain objects; if your store supports FormData pass it
        const storeResult = await storeCreateOption(fd);
        // If your store returns truthy value when successful, proceed to refresh
        if (storeResult) {
          await fetchOptions();
          resetNew();
          setPreviewSrc(null);
          return alert("Option created (via store).");
        }
        // otherwise fall through to direct fetch
      }

      // Option B: POST directly to your backend
      // Adjust the endpoint if it's different in your app (e.g. /api/options)
      const res = await fetch("/api/item-options", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create failed: ${res.status} ${txt}`);
      }

      await fetchOptions();
      resetNew();
      setPreviewSrc(null);
      alert("Option created successfully.");
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create option: " + err.message);
    }
  };

  // prepare editing an existing option (prefill form)
  const handleStartEdit = (opt) => {
    setEditOption({
      id: opt.id,
      item_option_group_id: opt.item_option_group_id ?? "",
      name: opt.name ?? "",
      price_adjust_cents: opt.price_adjust_cents ?? 0,
      icon: null, // new file if user chooses — keep null to mean "no change"
    });
    setEditPreviewSrc(opt.icon ?? null);
  };

  // update using multipart/form-data -> PUT /api/item-options/:id
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!editOption) return;
    if (!editOption.item_option_group_id) return alert("Please select an Item Option Group.");
    if (!editOption.name || !editOption.name.trim()) return alert("Name is required.");

    const fd = new FormData();
    fd.append("item_option_group_id", editOption.item_option_group_id);
    fd.append("name", editOption.name.trim());
    fd.append("price_adjust_cents", String(Number(editOption.price_adjust_cents) || 0));
    // If user selected a new file, append it. If not, don't append so backend keeps existing icon.
    if (editOption.icon instanceof File) {
      fd.append("icon", editOption.icon);
    }

    try {
      // Option A: try store update if it supports FormData
      if (typeof storeUpdateOption === "function") {
        const storeResult = await storeUpdateOption(editOption.id, fd);
        if (storeResult) {
          await fetchOptions();
          setEditOption(null);
          setEditPreviewSrc(null);
          return alert("Option updated (via store).");
        }
      }

      // Option B: direct fetch (use POST + _method=PUT if your backend expects that, or use PUT)
      // Laravel accepts POST with _method=PUT or real PUT if using fetch with FormData — we'll use POST with _method=PUT for compatibility
      fd.append("_method", "PUT");

      const res = await fetch(`/api/item-options/${editOption.id}`, {
        method: "POST", // because we're using _method=PUT
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Update failed: ${res.status} ${txt}`);
      }

      await fetchOptions();
      setEditOption(null);
      setEditPreviewSrc(null);
      alert("Option updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update option: " + err.message);
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      // try store delete if available
      if (typeof storeDeleteOption === "function") {
        const ok = await storeDeleteOption(id);
        if (ok) {
          await fetchOptions();
          return alert("Deleted (via store).");
        }
      }

      const res = await fetch(`/api/item-options/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} ${txt}`);
      }
      await fetchOptions();
      alert("Deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete: " + err.message);
    }
  };

  // handlers for file inputs and previews
  const handleIconChange = (file) => {
    if (!file) {
      setNewOption((s) => ({ ...s, icon: null }));
      setPreviewSrc(null);
      return;
    }
    setNewOption((s) => ({ ...s, icon: file }));
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
  };

  const handleEditIconChange = (file) => {
    if (!file) {
      setEditOption((s) => ({ ...s, icon: null }));
      setEditPreviewSrc(null);
      return;
    }
    setEditOption((s) => ({ ...s, icon: file }));
    setEditPreviewSrc(URL.createObjectURL(file));
  };

  const fmtPrice = (cents) => {
    const n = Number(cents ?? 0);
    return `$${(n / 100).toFixed(2)}`;
  };

// Build unique group list from options



  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "auto" }}>
      <h2 style={{ marginBottom: 12 }}>Option Groups (match backend store)</h2>

      {(loading || groupsLoading) && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {String(error)}</p>}

      {/* Table */}
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Group</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Price Adj</th>
              <th style={{ padding: 8 }}>Icon</th>
              <th style={{ padding: 8 }}>Created</th>
              <th style={{ padding: 8 }}>Updated</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.length === 0 && !loading && (
              <tr>
                <td colSpan="8" style={{ padding: 12, textAlign: "center" }}>
                  No options found.
                </td>
              </tr>
            )}

            {options.map((opt) => (
              <tr key={opt.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{opt.id}</td>
                <td style={{ padding: 8 }}>{opt.group?.name ?? "—"}</td>
                <td style={{ padding: 8 }}>{opt.name}</td>
                <td style={{ padding: 8 }}>{fmtPrice(opt.price_adjust_cents)}</td>
                <td style={{ padding: 8 }}>
                  {opt.icon ? (
                    <Image 
                    src={opt.icon} 
                    alt="icon" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                    unoptimized
                    width={40}
                    height={40}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: 8 }}>{opt.created_at ? new Date(opt.created_at).toLocaleString() : "—"}</td>
                <td style={{ padding: 8 }}>{opt.updated_at ? new Date(opt.updated_at).toLocaleString() : "—"}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleStartEdit(opt)} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(opt.id)} style={{ color: "white", background: "#e55353", border: "none", padding: "6px 8px", borderRadius: 4 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div style={{ marginBottom: 28 }}>
        <h3>Add New Option</h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 8, maxWidth: 560 }}>
          <label>
            Item Option Group
            <br />
            <select
            value={newOption.item_option_group_id}
            onChange={(e) =>
              setNewOption((s) => ({ ...s, item_option_group_id: e.target.value }))
            }
            required
          >
            <option value="">Select a group</option>

            {groupOptions.map((g,index) => (
              <option key={index + 1} value={g.id}>
                {g.name ?? "Unnamed Group"}
              </option>
            ))}
          </select>



          </label>

          <label>
            Name
            <br />
            <input
              value={newOption.name}
              onChange={(e) => setNewOption((s) => ({ ...s, name: e.target.value }))}
              required
              maxLength={100}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label>
            Price Adjust (cents)
            <br />
            <input
              type="number"
              min={0}
              value={newOption.price_adjust_cents}
              onChange={(e) => setNewOption((s) => ({ ...s, price_adjust_cents: Number(e.target.value) }))}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Enter price in cents (e.g. 150 = $1.50)</div>
          </label>

          <label>
            Icon (jpg, png, gif — max 2MB)
            <br />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files?.[0] ?? null)}
              style={{ marginTop: 6 }}
            />
          </label>

          {previewSrc && (
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Preview:</div>
              <Image
               src={previewSrc} 
               alt="preview" 
               style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }}
               width={80}
               height={80}
                unoptimized={true}

               />
            </div>
          )}

          <div>
            <button type="button" onClick={handleCreate} style={{ padding: "8px 12px", background: "#2b6cb0", color: "white", border: "none", borderRadius: 6 }}>
              Add Option
            </button>
          </div>
        </form>
      </div>

      {/* Edit form */}
      {editOption && (
        <div style={{ marginBottom: 20 }}>
          <h3>Edit Option #{editOption.id}</h3>
          <form onSubmit={handleUpdate} style={{ display: "grid", gap: 8, maxWidth: 560 }}>
            <label>
              Item Option Group
              <br />
              <select
  value={newOption.item_option_group_id}
          onChange={(e) =>
            setNewOption((s) => ({ ...s, item_option_group_id: e.target.value }))
          }
          required
        >
          <option value="">Select a group</option>

          {groupOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name ?? "Unnamed Group"}
            </option>
          ))}
        </select>

            </label>

            <label>
              Name
              <br />
              <input
                value={editOption.name}
                onChange={(e) => setEditOption((s) => ({ ...s, name: e.target.value }))}
                required
                maxLength={100}
                style={{ width: "100%", padding: 8, marginTop: 6 }}
              />
            </label>

            <label>
              Price Adjust (cents)
              <br />
              <input
                type="number"
                min={0}
                value={editOption.price_adjust_cents}
                onChange={(e) => setEditOption((s) => ({ ...s, price_adjust_cents: Number(e.target.value) }))}
                style={{ width: "100%", padding: 8, marginTop: 6 }}
              />
            </label>

            <label>
              Replace Icon (optional)
              <br />
              <input type="file" accept="image/*" onChange={(e) => handleEditIconChange(e.target.files?.[0] ?? null)} style={{ marginTop: 6 }} />
            </label>

            {editPreviewSrc && (
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Preview:</div>
                <Image src={editPreviewSrc} 
                alt="edit-preview"
               style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} 
               unoptimized={true}
               />
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={handleUpdate} style={{ padding: "8px 12px", background: "#2b6cb0", color: "white", border: "none", borderRadius: 6 }}>
                Save Changes
              </button>
              <button type="button" onClick={() => { setEditOption(null); setEditPreviewSrc(null); }} style={{ padding: "8px 12px", borderRadius: 6 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
