import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { FieldCard } from "../../../components/fields/FieldCard";

// If you already have these types elsewhere, feel free to delete these local ones.
type Sport = "basketball" | "football" | "tennis";
export type FieldDTO = {
  id: number;
  name: string;
  type: Sport | string;
  price_per_session?: number | null;
  is_active?: boolean;
  capacity?: number | null;
  // add any other props your FieldCard expects
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:8000";
const FIELDS_URL = `${API_BASE}/fields/`; // <— matches your Django URLconf

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    sport: (searchParams.get("sport") as Sport) || "basketball",
    q: searchParams.get("q") || "",
    date: searchParams.get("date") || "",
    surface: searchParams.get("surface") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const [fields, setFields] = useState<FieldDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // keep URL in sync with filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // build query string (backend may ignore most of these)
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.sport) p.set("type", filters.sport); // your API uses Field.type
    if (filters.maxPrice) p.set("max_price", filters.maxPrice);
    if (filters.surface) p.set("surface", filters.surface);
    if (filters.date) p.set("date", filters.date);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [filters]);

  // fetch fields (no custom hook)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${FIELDS_URL}${queryString}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to load fields (${res.status}) ${txt}`);
        }
        const data = (await res.json()) as FieldDTO[]; // your FieldView returns a list
        if (!cancelled) setFields(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "Failed to load fields");
          setFields([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const handleReserve = (field: FieldDTO) => {
    const params = new URLSearchParams({
      fieldId: String(field.id),
      sport: filters.sport,
      ...(filters.date && { date: filters.date }),
    });
    navigate(`/reserve?${params}`);
  };

  const clearFilters = () =>
    setFilters({ sport: "basketball", q: "", date: "", surface: "", maxPrice: "" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Explore{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Sports Fields
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Find and book the perfect field for your game
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <select
                    value={filters.sport}
                    onChange={(e) =>
                      setFilters({ ...filters, sport: e.target.value as Sport })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="basketball">🏀 Basketball</option>
                    <option value="football">⚽ Football</option>
                    <option value="tennis">🎾 Tennis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Field name or location..."
                      value={filters.q}
                      onChange={(e) =>
                        setFilters({ ...filters, q: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) =>
                      setFilters({ ...filters, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface
                  </label>
                  <select
                    value={filters.surface}
                    onChange={(e) =>
                      setFilters({ ...filters, surface: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Any surface</option>
                    <option value="court">Court</option>
                    <option value="turf">Turf</option>
                    <option value="grass">Grass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price ($/hr)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">
                {isLoading
                  ? "Loading..."
                  : `${fields.length} field${fields.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {err && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err.includes("/field/fields/")
                  ? "Bad URL. Your backend route is /fields/. The component is already pointing there."
                  : err}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Card className="h-80">
                      <div className="h-48 bg-gray-200 rounded-t-2xl" />
                      <CardContent>
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : fields.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No fields found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {fields.map((field) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FieldCard field={field} onReserve={handleReserve} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
