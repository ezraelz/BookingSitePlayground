import React, { useEffect, useState } from "react";
import axios from "../../../../hooks/api";
import { useNavigate } from "react-router-dom";

interface TimeslotType {
  id: number;
  time: string;
  is_active: boolean;
}

interface PlaygroundType {
  id: number;
  name: string;
  location: string;
  price_per_hour: number;
  is_active: boolean;
  timeslots: TimeslotType[];
}

const Playground: React.FC = () => {
  const [playgrounds, setPlaygrounds] = useState<PlaygroundType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newTimeslot, setNewTimeslot] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{pgId: number, tsId: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayground = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/fields/');
        setPlaygrounds(res.data);
      } catch (err) {
        setError("Failed to fetch playgrounds. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayground();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setDeleteConfirm(null);
  };

  const handleAddTimeslot = (pgId: number) => {
    if (!newTimeslot) return;
    
    // Create a more robust ID for the new timeslot
    const newId = Math.max(0, ...playgrounds.find(pg => pg.id === pgId)?.timeslots.map(ts => ts.id) || [0]) + 1;
    
    setPlaygrounds((prev) =>
      prev.map((pg) =>
        pg.id === pgId
          ? {
              ...pg,
              timeslots: [
                ...pg.timeslots,
                { id: newId, time: newTimeslot, is_active: true },
              ],
            }
          : pg
      )
    );
    setNewTimeslot("");
  };

  const handleToggleTimeslot = (pgId: number, tsId: number) => {
    setPlaygrounds((prev) =>
      prev.map((pg) =>
        pg.id === pgId
          ? {
              ...pg,
              timeslots: pg.timeslots.map((ts) =>
                ts.id === tsId ? { ...ts, is_active: !ts.is_active } : ts
              ),
            }
          : pg
      )
    );
  };

  const handleDeleteTimeslot = (pgId: number, tsId: number) => {
    setPlaygrounds((prev) =>
      prev.map((pg) =>
        pg.id === pgId
          ? {
              ...pg,
              timeslots: pg.timeslots.filter((ts) => ts.id !== tsId),
            }
          : pg
      )
    );
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Playgrounds Management</h1>
          <button 
            onClick={() => navigate(`/dashboard/playgrounds/add`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Playground
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {playgrounds.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No playgrounds</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first playground.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Hour</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {playgrounds.map((pg, index) => (
                    <React.Fragment key={pg.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pg.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pg.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pg.price_per_hour}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <button
                            onClick={() => toggleExpand(pg.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {expandedId === pg.id ? (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Hide Timeslots
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Manage Timeslots
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Timeslot Management Section */}
                      {expandedId === pg.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="mb-4">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Timeslots for {pg.name}</h3>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="HH:MM - HH:MM (e.g., 09:00 - 10:00)"
                                  value={newTimeslot}
                                  onChange={(e) => setNewTimeslot(e.target.value)}
                                  className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  onClick={() => handleAddTimeslot(pg.id)}
                                  disabled={!newTimeslot}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Timeslot
                                </button>
                              </div>
                            </div>
                            
                            {pg.timeslots.length === 0 ? (
                              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-gray-500">No timeslots available. Add a new timeslot to get started.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pg.timeslots.map((ts) => (
                                  <div key={ts.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                    <span className="font-medium">{ts.time}</span>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleToggleTimeslot(pg.id, ts.id)}
                                        className={`px-3 py-1 rounded text-xs font-medium ${
                                          ts.is_active
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                        } transition-colors`}
                                      >
                                        {ts.is_active ? "Active" : "Inactive"}
                                      </button>
                                      {deleteConfirm && deleteConfirm.pgId === pg.id && deleteConfirm.tsId === ts.id ? (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleDeleteTimeslot(pg.id, ts.id)}
                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                          >
                                            Confirm
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setDeleteConfirm({pgId: pg.id, tsId: ts.id})}
                                          className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors flex items-center"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;