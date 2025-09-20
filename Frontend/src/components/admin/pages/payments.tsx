import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../hooks/api";

// ---- Backend-aligned types ----
type PaymentStatus = "initiated" | "paid" | "failed" | "cancelled";

interface PlaygroundLite {
  id: number;
  name: string;
}

interface TimeSlotLite {
  id: number;
  start_time: string; // "06:00:00"
  end_time: string;   // "08:00:00"
}

interface SeriesLite {
  id: number;
  purchaser?: number | null; // profile id (optional)
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  playground?: PlaygroundLite;
  time_slot?: TimeSlotLite;
  weekday?: number;  // 0-6
  months?: 1 | 3 | 6;
  start_date?: string; // "YYYY-MM-DD"
  amount_etb?: number | string;
  currency?: string; // "ETB"
  chapa_tx_ref?: string;
  chapa_checkout_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Payment {
  id: number;
  series?: SeriesLite | null;
  tx_ref: string;
  amount_etb: number | string;
  currency: string; // "ETB"
  status: PaymentStatus;
  checkout_url?: string;
  paid_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// ---- Component ----
const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);

  // filters
  const [filters, setFilters] = useState({
    date: "", // YYYY-MM-DD
    status: "" as "" | PaymentStatus,
    search: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Payment[]>("/payments/");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    setShowDetail(true);
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await axios.get<Payment>(`/payments/${id}/`);
      setSelected(res.data);
    } catch (err) {
      // fallback to list item if detail endpoint isn't available
      const local = payments.find((p) => p.id === id) || null;
      setSelected(local);
      if (!local) toast.error("Failed to load payment details.");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelected(null);
  };

  // ---- helpers ----
  const toNumber = (v: unknown) =>
    typeof v === "number" ? v : typeof v === "string" ? Number(v) : 0;

  const formatETB = (amount: number | string) =>
    `ETB ${toNumber(amount).toLocaleString()}`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const statusBadge = (status: PaymentStatus) => {
    const map: Record<PaymentStatus, string> = {
      initiated: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`;
  };

  // ---- filtering ----
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return payments.filter((p) => {
      // search across tx_ref + series guest + playground
      const hay =
        [
          p.tx_ref,
          p.series?.guest_name,
          p.series?.guest_email,
          p.series?.guest_phone,
          p.series?.playground?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

      const matchesSearch = q ? hay.includes(q) : true;

      const matchesStatus = filters.status ? p.status === filters.status : true;

      const matchesDate = filters.date
        ? // compare only the date portion of created_at
          (p.created_at || "").slice(0, 10) === filters.date
        : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, filters]);

  // ---- stats ----
  const totalPaid = filtered
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + toNumber(p.amount_etb), 0);

  const totalInitiated = filtered
    .filter((p) => p.status === "initiated")
    .reduce((sum, p) => sum + toNumber(p.amount_etb), 0);

  const totalFailedOrCancelled = filtered
    .filter((p) => p.status === "failed" || p.status === "cancelled")
    .reduce((sum, p) => sum + toNumber(p.amount_etb), 0);

  // ---- events ----
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value as any }));
  };

  const clearFilters = () => setFilters({ date: "", status: "", search: "" });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chapa Payments</h1>
          <p className="text-gray-600 mt-1">Monitor and manage payment transactions</p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">{formatETB(totalPaid)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Initiated (Pending)</p>
              <p className="text-2xl font-bold text-yellow-600">{formatETB(totalInitiated)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarDaysIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed/Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">{formatETB(totalFailedOrCancelled)}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ArrowTrendingDownIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search tx_ref, guest, phone, email, playground..."
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date (created_at day) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="initiated">Initiated</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {(filters.search || filters.date || filters.status) && (
          <div className="flex items-center mt-4 gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
              </span>
            )}
            {filters.date && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Date: {filters.date}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {filters.status}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2 flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest & Playground
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-28 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">#{p.id}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">tx_ref: {p.tx_ref}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {p.series?.guest_name || "-"}
                        {p.series?.guest_phone ? ` • ${p.series.guest_phone}` : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.series?.guest_email || ""}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.series?.playground?.name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatETB(p.amount_etb)}
                      </div>
                      <div className="text-xs text-gray-500">{p.currency}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusBadge(p.status)}>{p.status}</span>
                      {p.status === "paid" && p.paid_at && (
                        <div className="text-xs text-gray-500 mt-1">Paid: {formatDate(p.paid_at)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Created: {formatDate(p.created_at)}</div>
                      <div className="text-xs text-gray-500">Updated: {formatDateTime(p.updated_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openDetail(p.id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {p.status === "initiated" && p.checkout_url && (
                        <a
                          href={p.checkout_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors inline-flex"
                          title="Open checkout"
                        >
                          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <CurrencyDollarIcon className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="font-medium">No payments found</p>
                      <p className="text-sm mt-1">
                        {filters.search || filters.date || filters.status
                          ? "Try adjusting your search or filters"
                          : "No payments have been recorded yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary footer */}
      {!loading && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filtered.length} of {payments.length} payments
            </div>
            <div className="text-sm font-medium text-gray-900">
              Total (filtered, any status): {formatETB(filtered.reduce((s, p) => s + toNumber(p.amount_etb), 0))}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeDetail} aria-hidden="true" />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                {selected && (
                  <p className="text-sm text-gray-500 mt-1">
                    #{selected.id} • tx_ref {selected.tx_ref}
                  </p>
                )}
              </div>
              <button
                onClick={closeDetail}
                className="text-gray-500 hover:text-gray-700 rounded-md p-2 hover:bg-gray-50"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {detailLoading || !selected ? (
              <div className="py-10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(selected.status).replace("inline-flex items-center ", "")}`}>
                      {selected.status}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="mt-1 text-sm text-gray-800">{formatETB(selected.amount_etb)} ({selected.currency})</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Guest</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Name:</span> {selected.series?.guest_name || "-"}</div>
                    <div><span className="text-gray-500">Email:</span> {selected.series?.guest_email || "-"}</div>
                    <div><span className="text-gray-500">Phone:</span> {selected.series?.guest_phone || "-"}</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Playground & Slot</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Playground:</span> {selected.series?.playground?.name || "-"}</div>
                    <div><span className="text-gray-500">Start:</span> {selected.series?.start_date ? selected.series.start_date : "-"}</div>
                    <div>
                      <span className="text-gray-500">Time:</span>{" "}
                      {selected.series?.time_slot
                        ? `${selected.series.time_slot.start_time?.slice(0,5)} – ${selected.series.time_slot.end_time?.slice(0,5)}`
                        : "-"}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Meta</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Created:</span> {formatDateTime(selected.created_at)}</div>
                    <div><span className="text-gray-500">Updated:</span> {formatDateTime(selected.updated_at)}</div>
                    <div><span className="text-gray-500">Paid at:</span> {formatDateTime(selected.paid_at)}</div>
                    <div className="md:col-span-2"><span className="text-gray-500">Checkout URL:</span>{" "}
                      {selected.checkout_url ? (
                        <a
                          href={selected.checkout_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          open
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>

                {selected.status === "initiated" && selected.checkout_url && (
                  <div className="flex justify-end">
                    <a
                      href={selected.checkout_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                      Open Checkout
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
