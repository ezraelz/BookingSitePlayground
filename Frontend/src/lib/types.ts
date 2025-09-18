export type Sport = 'basketball' | 'football';

export type FieldDTO = {
  id: number;
  name: string;
  sports: Sport[];
  location: string;
  surface?: 'turf' | 'grass' | 'court';
  images: string[];
  basePricePerHour: number;
  openHour: string;
  closeHour: string;
  blackoutDates?: string[];
  rating?: number;
  nextAvailable?: { date: string; start: string } | null;
};

export type TimeSlotDTO = {
  fieldId: number;
  date: string;
  start: string;
  end: string;
  isBooked: boolean;
  pricePerHour: number;
};

export type RecurrenceRuleDTO = {
  freq: 'none' | 'monthly' | 'yearly';
  count?: number;
  until?: string;
  handleMissingDay?: 'skip' | 'last-day';
};

export type ReservationDTO = {
  id: number;
  fieldId: number;
  fieldName: string;
  sport: Sport;
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
  user: { name: string; email: string; phone?: string };
  addOns?: { lights?: boolean; equipmentPack?: boolean; coach?: boolean };
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  seriesId?: number | null;
};

export type ReservationSeriesDTO = {
  id: number;
  rule: RecurrenceRuleDTO;
  anchor: { date: string; start: string; durationMinutes: number };
  fieldId: number;
  fieldName: string;
  sport: Sport;
  user: { name: string; email: string; phone?: string };
  addOns?: { lights?: boolean; equipmentPack?: boolean; coach?: boolean };
  total: number;
  status: 'pending' | 'partially_confirmed' | 'confirmed' | 'cancelled';
  occurrences: Array<ReservationDTO & { conflict?: boolean }>;
};

export type BookingFormData = {
  fieldId: number;
  sport: Sport;
  date: string;
  start: string;
  durationMinutes: number;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  addOns?: {
    lights?: boolean;
    equipmentPack?: boolean;
    coach?: boolean;
  };
  recurrence?: RecurrenceRuleDTO;
};