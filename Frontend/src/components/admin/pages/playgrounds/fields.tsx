import React, { useEffect, useState } from "react";
import axios from "../../../../hooks/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type SportType = "football" | "tennis" | "basketball";

interface PlaygroundType {
  id: number;
  name: string;
  type: SportType;
  location: string;
  price_per_session: number;
  is_active: boolean;
  image?: string | null;
  created_at?: string;
}

const Playgrounds: React.FC = () => {
  const navigate = useNavigate();

  const [playgrounds, setPlaygrounds] = useState<PlaygroundType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: SportType;
    location: string;
    price_per_session: number | string;
    is_active: boolean;
    imageFile: File | null;
  }>({
    name: "",
    type: "football",
    location: "",
    price_per_session: "",
    is_active: true,
    imageFile: null,
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // fetch
  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get<PlaygroundType[]>("/fields/");
      setPlaygrounds(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch playgrounds. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // open edit
  const openEdit = (pg: PlaygroundType) => {
    setEditingId(pg.id);
    setEditForm({
      name: pg.name,
      type: pg.type,
      location: pg.location,
      price_per_session: pg.price_per_session,
      is_active: pg.is_active,
      imageFile: null,
    });
    setIsEditing(true);
  };

  // update edit form
  const onEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price_per_session"
          ? value
          : (value as any),
    }));
  };
  const onEditFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }));
  };

  // submit edit
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      // Use FormData if image is included, else JSON is fine
      let payload: any;
      let headers: Record<string, string> | undefined;

      if (editForm.imageFile) {
        const fd = new FormData();
        fd.append("name", editForm.name);
        fd.append("type", editForm.type);
        fd.append("location", editForm.location);
        fd.append("price_per_session", String(editForm.price_per_session || 0));
        fd.append("is_active", String(editForm.is_active));
        fd.append("image", editForm.imageFile);
        payload = fd;
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        payload = {
          name: editForm.name,
          type: editForm.type,
          location: editForm.location,
          price_per_session: Number(editForm.price_per_session || 0),
          is_active: editForm.is_active,
        };
      }

      await axios.put(`/fields/${editingId}/`, payload, { headers });
      toast.success("Playground updated");
      setIsEditing(false);
      setEditingId(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update playground");
    }
  };

  // delete
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axios.delete(`/fields/${deletingId}/`);
      toast.success("Playground deleted");
      setDeletingId(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete playground");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-12 w-12 rounded-full border-b-2 border-blue-600 animate-spin mx-auto mt-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Playgrounds Management
          </h1>
          <button
            onClick={() => navigate(`/dashboard/playgrounds/add`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Add Playground
          </button>
        </div>

        {/* table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {playgrounds.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No playgrounds
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first playground.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price / Session (ETB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {playgrounds.map((pg, i) => (
                    <tr key={pg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {pg.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {pg.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{pg.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {Number(pg.price_per_session).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${
                            pg.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pg.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-center space-x-2">
                        <button
                          onClick={() => openEdit(pg)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(pg.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Playground
            </h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={onEditChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sport Type
                </label>
                <select
                  name="type"
                  value={editForm.type}
                  onChange={onEditChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="football">Football</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  name="location"
                  value={editForm.location}
                  onChange={onEditChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price per Session (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price_per_session"
                  value={editForm.price_per_session}
                  onChange={onEditChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={editForm.is_active}
                  onChange={onEditChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Replace Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onEditFile}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900">
              Delete playground?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playgrounds;
