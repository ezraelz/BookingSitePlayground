import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";

/* ===========================
   Config & Debug Helpers
=========================== */
const DEBUG = true;
const BASE_URL = "http://127.0.0.1:8000";

const log = {
  info: (...args: any[]) => DEBUG && console.info("[booking]", ...args),
  warn: (...args: any[]) => DEBUG && console.warn("[booking]", ...args),
  error: (...args: any[]) => console.error("[booking]", ...args),
  group: (label: string) => DEBUG && console.group(`[booking] ${label}`),
  groupEnd: () => DEBUG && console.groupEnd(),
  table: (data: any) => DEBUG && console.table?.(data),
};

const api = axios.create({ baseURL: BASE_URL, withCredentials: false });

/* Interceptors (nice grouped console logs) */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    log.group(`REQUEST ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`);
    log.info("Headers:", config.headers);
    log.info("Params:", (config as any).params);
    log.info("Data:", (config as any).data);
    log.groupEnd();
    return config;
  },
  (error: AxiosError) => {
    log.error("REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res: AxiosResponse) => {
    log.group(`RESPONSE ${res.config.method?.toUpperCase()} ${res.config.url} → ${res.status}`);
    log.info("Data:", res.data);
    log.groupEnd();
    return res;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    log.group(`RESPONSE ERROR ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}`);
    log.error("Error message:", error.message);
    log.error("Response data:", error.response?.data);
    log.error("Headers:", error.response?.headers);
    log.groupEnd();
    return Promise.reject(error);
  }
);

/* ===========================
   Types
=========================== */
type Sport = "football" | "basketball" | "tennis";
type PlanType = "1m" | "3m" | "6m";

interface FieldRow {
  id: number;
  name: string;
  type?: Sport | string;
  price_per_session?: string | number;
  price_per_hour?: string | number;
  is_active?: boolean;
  location?: string;
  image?: string | null;
}

interface TimeslotRow {
  id: number;
  start_time: string;
  end_time: string;
  sequence?: number;
  status?: string;
  created_at?: string;
  price_per_hour?: string | number;
}

type SlotStatus = "available" | "booked" | "closed";
type AnyAvailabilityRow =
  | { id?: number; status?: SlotStatus; label?: string; start_time?: string; end_time?: string }
  | string;

interface StartCheckoutResponse {
  checkout_url: string;
  tx_ref: string;
  occurrences: number;
  amount_etb: string;
  series: any;
}

/* ===========================
   Helpers
=========================== */
const monthsForPlan: Record<PlanType, number> = { "1m": 1, "3m": 3, "6m": 6 };

/** JS getDay(): Sun=0..Sat=6 → Python weekday(): Mon=0..Sun=6 */
const jsToPythonWeekday = (jsDay: number) => (jsDay + 6) % 7;

const cutHHMM = (t: string) => (t?.length >= 5 ? t.slice(0, 5) : t || "");
const timeKey = (startHHMM: string, endHHMM: string) => `${startHHMM}-${endHHMM}`;
const makeLabel = (start: string, end: string) => `${cutHHMM(start)} - ${cutHHMM(end)}`;

/** Prefer WITH trailing slash first to avoid Django APPEND_SLASH redirect on POST */
const buildVariants = (paths: string[]) => {
  const s = new Set<string>();
  for (const p of paths) {
    const withSlash = p.endsWith("/") ? p : `${p}/`;
    const noSlash = p.endsWith("/") ? p.slice(0, -1) : p;
    s.add(withSlash);
    s.add(noSlash);
  }
  return Array.from(s);
};

async function getFirstOk<T>(paths: string[], params?: Record<string, any>) {
  const variants = buildVariants(paths);
  let lastErr: any = null;
  for (const p of variants) {
    try {
      log.group(`GET TRY ${p}`);
      log.info("Params:", params ?? {});
      const res = await api.get<T>(p, { params });
      log.info("OK:", res.status);
      log.groupEnd();
      return res.data;
    } catch (e: any) {
      lastErr = e;
      const s = e?.response?.status;
      log.warn(`GET FAIL ${p} →`, s);
      if (s === 404 || s === 301 || s === 302) {
        log.groupEnd();
        continue;
      }
      log.groupEnd();
      throw e;
    }
  }
  throw lastErr || new Error(`No matching GET endpoint for: ${paths.join(", ")}`);
}

async function postFirstOk<T>(paths: string[], body: any) {
  const variants = buildVariants(paths);
  let lastErr: any = null;
  for (const p of variants) {
    try {
      log.group(`POST TRY ${p}`);
      log.info("Body:", body);
      const res = await api.post<T>(p, body);
      log.info("OK:", res.status);
      log.groupEnd();
      return res.data;
    } catch (e: any) {
      const s = e?.response?.status;
      log.warn(`POST FAIL ${p} →`, s);
      if (s === 404 || s === 301 || s === 302) {
        log.groupEnd();
        continue;
      }
      const payload = e?.response?.data ?? e;
      log.groupEnd();
      throw payload; // bubble raw DRF errors
    }
  }
  throw lastErr || new Error(`No matching POST endpoint for: ${paths.join(", ")}`);
}

async function getListEither<T>(paths: string[]): Promise<T[]> {
  const data = await getFirstOk<T[] | { results?: T[] }>(paths);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).results)) return (data as any).results;
  return [];
}

/* Endpoints (with slash first) */
const FIELD_PATHS = ["/fields/", "/field/"];
const TIMESLOT_PATHS = ["/timeslot/", "/timeslots/"];
const AVAILABILITY_PATHS = ["/availability/", "/booking/availability/", "/api/booking/availability/"];
const CHECKOUT_PATHS = ["/series/start-checkout/", "/booking/series/start-checkout/"];

/* ===========================
   Component
=========================== */
const FieldSeriesBookingPage: React.FC = () => {
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [timeslots, setTimeslots] = useState<TimeslotRow[]>([]);
  const [sport, setSport] = useState<Sport | "all">("all");

  const [selectedFieldId, setSelectedFieldId] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));

  const [availabilityRaw, setAvailabilityRaw] = useState<AnyAvailabilityRow[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  const [selectedTimeslotId, setSelectedTimeslotId] = useState<number | "">("");

  // guest details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [plan, setPlan] = useState<PlanType>("1m");
  const [submitting, setSubmitting] = useState(false);

  /* Load fields + timeslots */
  useEffect(() => {
    (async () => {
      try {
        const [flds, tslots] = await Promise.all([
          getListEither<FieldRow>(FIELD_PATHS),
          getListEither<TimeslotRow>(TIMESLOT_PATHS),
        ]);

        const cleanFields = flds.filter((f) => f.is_active !== false);
        const cleanSlots = tslots
          .map((t) => ({
            ...t,
            sequence:
              typeof t.sequence === "number"
                ? t.sequence
                : Number(cutHHMM(t.start_time).slice(0, 2)) * 60 +
                  Number(cutHHMM(t.start_time).slice(3, 5)),
          }))
          .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

        log.group("INIT LOAD");
        log.table(cleanFields);
        log.table(cleanSlots);
        log.groupEnd();

        setFields(cleanFields);
        setTimeslots(cleanSlots);
      } catch (e) {
        log.error("Init load failed:", e);
        toast.error("Failed to load fields or timeslots");
      }
    })();
  }, []);

  /* Filter by sport (optional) */
  const filteredFields = useMemo(() => {
    const out = sport === "all" ? fields : fields.filter((f) => (f.type ? f.type === sport : true));
    DEBUG && log.info("Filtered fields →", out.length);
    return out;
  }, [fields, sport]);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === Number(selectedFieldId)),
    [fields, selectedFieldId]
  );

  /* Load availability for a (field,date) */
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedFieldId || !date) {
        setAvailabilityRaw([]);
        setSelectedTimeslotId("");
        return;
      }
      setLoadingAvail(true);
      try {
        const data = await getFirstOk<
          AnyAvailabilityRow[] | { available?: Record<string, string[]> }
        >(AVAILABILITY_PATHS, { field_id: selectedFieldId, date });

        let rows: AnyAvailabilityRow[] = [];
        if (Array.isArray(data)) {
          rows = data;
        } else if (data && typeof data === "object" && (data as any).available) {
          const labels = (data as any).available?.[date] ?? [];
          rows = labels.map((label: string) => ({ label, status: "available" }));
        }

        log.group("AVAILABILITY RAW");
        log.info("Field:", selectedFieldId, "Date:", date);
        log.table(rows);
        log.groupEnd();

        setAvailabilityRaw(rows);

        // keep selection if still available
        setSelectedTimeslotId((prev) => {
          if (!prev) return prev;
          const keyWanted = timeKey(
            cutHHMM(timeslots.find((t) => t.id === prev)?.start_time || ""),
            cutHHMM(timeslots.find((t) => t.id === prev)?.end_time || "")
          );
          const stillOk = rows.some((r) => {
            if (typeof r === "string") {
              const m = r.match(/^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
              if (!m) return false;
              return timeKey(m[1], m[2]) === keyWanted;
            }
            if (r.id && r.id === prev && r.status === "available") return true;
            if (r.label) {
              const m = r.label.match(/^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
              if (!m) return false;
              return timeKey(m[1], m[2]) === keyWanted && r.status === "available";
            }
            if (r.start_time && r.end_time) {
              return (
                timeKey(cutHHMM(r.start_time), cutHHMM(r.end_time)) === keyWanted &&
                r.status === "available"
              );
            }
            return false;
          });
          DEBUG && log.info("Keep selected slot?", stillOk, "Prev:", prev);
          return stillOk ? prev : "";
        });
      } catch (e) {
        log.error("Availability load failed:", e);
        toast.error("Failed to load availability");
        setAvailabilityRaw([]);
      } finally {
        setLoadingAvail(false);
      }
    };
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, date, timeslots.length]);

  /* Build a map key->status from availability */
  const availabilityIndex = useMemo(() => {
    const map = new Map<string | number, SlotStatus>();
    for (const row of availabilityRaw) {
      if (typeof row === "string") {
        const m = row.match(/^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
        if (!m) continue;
        map.set(timeKey(m[1], m[2]), "available");
        continue;
      }
      const obj = row as AnyAvailabilityRow;
      const status = (obj.status as SlotStatus) || "available";

      if (obj.id != null) {
        map.set(obj.id, status);
      } else if (obj.label) {
        const m = obj.label.match(/^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/);
        if (!m) continue;
        map.set(timeKey(m[1], m[2]), status);
      } else if (obj.start_time && obj.end_time) {
        map.set(timeKey(cutHHMM(obj.start_time), cutHHMM(obj.end_time)), status);
      }
    }
    DEBUG && log.info("availabilityIndex size:", map.size);
    return map;
  }, [availabilityRaw]);

  /* Enriched display */
  const enriched = useMemo(() => {
    const arr = timeslots.map((t) => {
      const keyByTime = timeKey(cutHHMM(t.start_time), cutHHMM(t.end_time));
      const statusById = availabilityIndex.get(t.id) as SlotStatus | undefined;
      const statusByTime = availabilityIndex.get(keyByTime) as SlotStatus | undefined;
      const status: SlotStatus = statusById || statusByTime || "closed";
      return {
        id: t.id,
        label: makeLabel(t.start_time, t.end_time),
        status,
        start_time: cutHHMM(t.start_time),
        end_time: cutHHMM(t.end_time),
      };
    });
    DEBUG && log.table(arr);
    return arr;
  }, [timeslots, availabilityIndex]);

  const pricePerSession = selectedField ? Number(selectedField.price_per_session || 0) : 0;
  const months = monthsForPlan[plan];
  const estimatedSessions = 4 * months;
  const estimatedTotal = pricePerSession * estimatedSessions;

  /* Start checkout (series) */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) return toast.error("Choose a field");
    if (!date) return toast.error("Choose a start date");
    if (!selectedTimeslotId) return toast.error("Choose a time slot");
    if (!guestName || !guestEmail || !guestPhone) return toast.error("Fill your info");

    // Compute weekday the way the serializer expects (Mon=0..Sun=6)
    // Add "T00:00:00" for consistent parsing across timezones.
    const jsDay = new Date(`${date}T00:00:00`).getDay(); // Sun=0..Sat=6
    const weekday = jsToPythonWeekday(jsDay);           // Mon=0..Sun=6

    const payload = {
      playground: Number(selectedFieldId),
      time_slot: Number(selectedTimeslotId),
      weekday,                 // ✅ required by your serializer
      months,
      start_date: date,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
    };

    setSubmitting(true);
    try {
      log.group("START CHECKOUT PAYLOAD");
      log.info(payload);
      log.groupEnd();

      const data = await postFirstOk<StartCheckoutResponse>(CHECKOUT_PATHS, payload);

      log.group("CHECKOUT RESPONSE");
      log.info("checkout_url:", data.checkout_url);
      log.info("tx_ref:", data.tx_ref);
      log.info("occurrences:", data.occurrences);
      log.info("amount_etb:", data.amount_etb);
      log.groupEnd();

      toast.success("Redirecting to payment…");
      window.location.href = data.checkout_url;
    } catch (err: any) {
      log.error("Checkout failed (raw server payload):", err);
      let msg = "Failed to start checkout";
      if (typeof err === "string") msg = err;
      else if (err?.non_field_errors?.length) msg = err.non_field_errors.join("\n");
      else if (err?.detail) msg = err.detail;
      else if (err?.weekday?.length) msg = err.weekday.join("\n"); // 👈 surface the 'weekday' error explicitly
      else if (typeof err === "object") msg = JSON.stringify(err, null, 2);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  /* ===========================
     UI
  =========================== */
  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Reserve Weekly Sessions</h1>
          <p className="text-gray-600">1 / 3 / 6 months · 2-hour fixed sessions</p>
        </header>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
          {/* Your Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Field & Date */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Field & Start Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as Sport | "all")}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">All sports</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
              </select>

              <select
                value={selectedFieldId}
                onChange={(e) => {
                  setSelectedFieldId(e.target.value ? Number(e.target.value) : "");
                  setSelectedTimeslotId("");
                }}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">-- Select Field --</option>
                {filteredFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.location ? `- ${f.location}` : ""} (ETB {Number(f.price_per_session ?? 0)})
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedTimeslotId("");
                }}
                min={today}
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pick Time Slot (2 hours)</h3>

            {!selectedFieldId || !date ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                Select a field and date to view slots.
              </div>
            ) : loadingAvail ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              </div>
            ) : timeslots.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                No timeslots configured. Create some timeslots first.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {enriched.map((row) => {
                  const disabled = row.status !== "available";
                  const active = selectedTimeslotId === row.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => !disabled && setSelectedTimeslotId(row.id)}
                      className={`p-4 rounded-lg border text-center transition ${
                        disabled
                          ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed"
                          : active
                          ? "bg-emerald-100 border-emerald-500"
                          : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                      }`}
                      disabled={disabled}
                      title={row.label}
                    >
                      <div className="font-medium">{row.label}</div>
                      <div className="text-xs mt-1">
                        {disabled ? row.status.toUpperCase() : "AVAILABLE"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan + pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Plan</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["1m", "3m", "6m"] as PlanType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`py-3 rounded-lg border font-semibold ${
                      plan === p ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300"
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Weekly session for {monthsForPlan[plan]} month(s).
              </p>
            </div>

            <div className="md:col-span-2 text-right">
              <div className="text-sm text-gray-500">Price per session</div>
              <div className="text-2xl font-bold">ETB {pricePerSession.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">
                Est. sessions: {estimatedSessions} · Est. total:{" "}
                <span className="font-semibold">ETB {Number(estimatedTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedFieldId || !selectedTimeslotId || !date}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold shadow-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Starting checkout..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default FieldSeriesBookingPage;
