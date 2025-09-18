import axios from "../../../../hooks/api";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define TypeScript interface for form state
interface PlaygroundForm {
  name: string;
  location: string;
  price_per_hour: number;
  image: File | null;
  is_active: boolean; 
}

const AddPlayground: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref to reset file input
  const [form, setForm] = useState<PlaygroundForm>({
    name: "",
    location: "",
    price_per_hour: 0,
    image: null,
    is_active: true, // Default to true (active)
  });

  // Handle text, number, and checkbox inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price_per_hour" ? Number(value) : value,
    }));
  };

  // Handle file input separately
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New field Data:", form);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("price_per_hour", form.price_per_hour.toString());
      formData.append("is_active", form.is_active.toString()); // Add is_active to FormData
      if (form.image) {
        formData.append("image", form.image);
      }

      // Send POST request
      await axios.post("/fields/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Playground created successfully!");

      // Reset form
      setForm({
        name: "",
        location: "",
        price_per_hour: 0,
        image: null,
        is_active: true, // Reset to default
      });

      // Reset file input UI
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
            accept="image/*"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price per hour */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price per hour</label>
          <input
            type="number"
            name="price_per_hour"
            value={form.price_per_hour}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Is Active</label>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
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