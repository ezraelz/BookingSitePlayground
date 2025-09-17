import React, { useEffect, useState } from "react";
import api from "../../../hooks/api";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await api.get<Field[]>("/field/");
        // Ensure data is always an array
        setFields(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch playgrounds. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">All Playgrounds</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Find Your Perfect Playground</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the best football fields in town and reserve your spot for the perfect game.
          </p>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-5xl mb-4">⚽</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No playgrounds available</h2>
            <p className="text-gray-600">Check back later for new field listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div
                key={field.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={
                      field.image
                        ? `${import.meta.env.VITE_API_URL}${field.image}`
                        : "/placeholder-field.jpg"
                    }
                    alt={field.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-field.jpg";
                    }}
                  />
                  {!field.is_active && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      UNAVAILABLE
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{field.name}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{field.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {field.price_per_hour
                        ? `$${field.price_per_hour}/hour`
                        : "Price not available"}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/reserve/${field.id}`)}
                    disabled={!field.is_active}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      field.is_active 
                        ? "bg-blue-500 hover:bg-blue-600 text-white" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {field.is_active ? "Reserve Now" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playgrounds;