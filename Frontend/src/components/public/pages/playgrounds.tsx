import React, { useEffect, useState } from "react";
import api from "../../../hooks/api";

interface Field {
  id: number;
  name: string;
  location: string;
  price_per_hour: string;
  image: string | null;
  is_active: boolean;
}

const Playgrounds: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        const res = await api.get<Field[]>("/field/");
        // Ensure data is always an array
        setFields(Array.isArray(res.data) ? res.data : []);
        console.log("Fetched fields:", res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch playgrounds.");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-700">Loading fields...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">All Playgrounds</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fields.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center">
            No fields found
          </p>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <img
                src={
                  field.image
                    ? `${import.meta.env.VITE_API_URL}${field.image}`
                    : "/placeholder.png"
                }
                alt={field.name}
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
              <h2 className="text-lg font-bold mb-2">{field.name}</h2>
              <p className="text-gray-600">{field.location}</p>
              <p className="text-gray-600 mb-2">
                {field.price_per_hour
                  ? `$${field.price_per_hour}`
                  : "Price not available"}
              </p>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded-lg transition">
                Reserve
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Playgrounds;
