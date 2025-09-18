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

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newTimeslot, setNewTimeslot] = useState("");
  const navigate = useNavigate();

  useEffect(()=> {
    const fetchPlayground = async ()=> {
      const res = await axios.get('/fields/');
      setPlaygrounds(res.data);
    }
    fetchPlayground();
  }, []);

  const toggleExpand = (id: number) =>
    setExpandedId(expandedId === id ? null : id);

  const handleAddTimeslot = (pgId: number) => {
    if (!newTimeslot) return;
    setPlaygrounds((prev) =>
      prev.map((pg) =>
        pg.id === pgId
          ? {
              ...pg,
              timeslots: [
                ...pg.timeslots,
                { id: pg.timeslots.length + 1, time: newTimeslot, is_active: true },
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
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-6">Playgrounds Management</h1>
        <button 
          onClick={()=> navigate(`/dashboard/playgrounds/add`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Playground
        </button>
      </div>
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">No</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Price per Hour</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {playgrounds.map((pg, index) => (
              <React.Fragment key={pg.id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{pg.name}</td>
                  <td className="p-3">{pg.location}</td>
                  <td className="p-3">${pg.price_per_hour}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        pg.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pg.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => toggleExpand(pg.id)}
                      className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Manage Timeslots
                    </button>
                  </td>
                </tr>

                {/* Timeslot Row */}
                {expandedId === pg.id && (
                  <tr>
                    <td colSpan={5} className="p-4 bg-gray-50">
                      <div className="mb-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="New Timeslot"
                          value={newTimeslot}
                          onChange={(e) => setNewTimeslot(e.target.value)}
                          className="border px-3 py-2 rounded w-64"
                        />
                        <button
                          onClick={() => handleAddTimeslot(pg.id)}
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {pg.timeslots.map((ts) => (
                          <li
                            key={ts.id}
                            className="flex justify-between items-center border p-2 rounded"
                          >
                            <span>{ts.time}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleToggleTimeslot(pg.id, ts.id)
                                }
                                className={`px-2 py-1 text-sm rounded ${
                                  ts.is_active
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {ts.is_active ? "Active" : "Inactive"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteTimeslot(pg.id, ts.id)
                                }
                                className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Playground;
