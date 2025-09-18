import { format, addMonths, addYears, getDaysInMonth, isValid } from 'date-fns';
import type { RecurrenceRuleDTO, TimeSlotDTO } from './types';

export function calculatePrice(
  basePricePerHour: number,
  durationMinutes: number,
  date: string,
  start: string,
  addOns?: { lights?: boolean; equipmentPack?: boolean; coach?: boolean }
): number {
  const hours = durationMinutes / 60;
  let total = basePricePerHour * hours;

  // Weekend multiplier
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    total *= 1.15;
  }

  // Lights surcharge after 6 PM
  const hour = parseInt(start.split(':')[0]);
  if (hour >= 18 || addOns?.lights) {
    total += 25;
  }

  // Add-ons
  if (addOns?.equipmentPack) total += 15;
  if (addOns?.coach) total += 50;

  return Math.round(total * 100) / 100;
}

export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function generateRecurrenceOccurrences(
  anchorDate: string,
  rule: RecurrenceRuleDTO
): string[] {
  if (rule.freq === 'none') return [anchorDate];

  const occurrences: string[] = [];
  const anchor = new Date(anchorDate);
  let current = new Date(anchor);
  let count = 0;

  while (count < (rule.count || 12) && occurrences.length < 52) {
    if (rule.until) {
      const until = new Date(rule.until);
      if (current > until) break;
    }

    if (rule.freq === 'monthly') {
      // Handle missing day logic
      const anchorDay = anchor.getDate();
      const currentMonthDays = getDaysInMonth(current);
      
      if (anchorDay > currentMonthDays) {
        if (rule.handleMissingDay === 'last-day') {
          current.setDate(currentMonthDays);
        } else {
          // Skip this month
          current = addMonths(current, 1);
          count++;
          continue;
        }
      } else {
        current.setDate(anchorDay);
      }
    }

    if (isValid(current)) {
      occurrences.push(format(current, 'yyyy-MM-dd'));
    }

    // Move to next occurrence
    if (rule.freq === 'monthly') {
      current = addMonths(current, 1);
    } else if (rule.freq === 'yearly') {
      current = addYears(current, 1);
    }
    
    count++;
  }

  return occurrences;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}