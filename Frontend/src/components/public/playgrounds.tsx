import React, { useEffect, useState } from 'react';
import axios from '../../hooks/api';

interface Field {
  id: number;
  name: string;
  location: string;
  price_per_hour: string;
  // Add other field properties as needed
}

const Playgrounds = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Field[]>('/field/');
        setFields(res.data || []); // make sure it's always an array
        console.log('fields', res.data);
      } catch (err) {
        setError('Failed to fetch playgrounds.');
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) return <div className="p-6 text-gray-700">Loading fields...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {fields.length < 1 ? (
        'No fields found'
      ) : (
        fields.map((field) => (
          <div
            key={field.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold mb-2">{field.name}</h2>
            <p className="text-gray-600">{field.location}</p>
            <p className="text-gray-600">{field.price_per_hour}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Playgrounds;
