import axios from "../../../../hooks/api";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ← Backend fields: name, type, price_per_session, location, image?, is_active
type SportType = "football" | "tennis" | "basketball";

interface PlaygroundForm {
  name: string;
  type: SportType;
  location: string;
  price_per_session: number;
  image: File | null;
  is_active: boolean;
}

const AddPlayground: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PlaygroundForm>({
    name: "",
    type: "football",
    location: "",
    price_per_session: 0,
    image: null,
    is_active: true,
  });

  // Handle text/number/checkbox/select inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price_per_session"
          ? Number(value)
          : value,
    }));
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("type", form.type); // must be one of: football/tennis/basketball
      fd.append("location", form.location);
      fd.append("price_per_session", form.price_per_session.toString());
      fd.append("is_active", String(form.is_active));
      if (form.image) fd.append("image", form.image);

      await axios.post("/fields/", fd);
      toast.success("Playground created successfully!");

      // Reset
      setForm({
        name: "",
        type: "football",
        location: "",
        price_per_session: 0,
        image: null,
        is_active: true,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Optional: go back to list
      // navigate(-1);
    } catch (error) {
      console.error("Error creating playground:", error);
      toast.error("Failed to create playground. Please try again.");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-7 max-w-lg mx-auto mt-2">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Back
      </button>

      <h2 className="text-xl font-bold mb-3">Add New Playground</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sport Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sport Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="football">Football</option>
            <option value="tennis">Tennis</option>
            <option value="basketball">Basketball</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept="image/*"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price per session (ETB) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price per Session (ETB)
          </label>
          <input
            type="number"
            name="price_per_session"
            value={form.price_per_session}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm font-medium text-gray-700">Active</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save Playground
        </button>
      </form>
    </div>
  );
};

export default AddPlayground;
