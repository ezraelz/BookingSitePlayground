import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge, PriceBadge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import type { FieldDTO } from '../../lib/types';

interface FieldCardProps {
  field: FieldDTO;
  /** Optional; ignored for navigation — we always go to /booking */
  onReserve?: (field: FieldDTO) => void;
}

const PLACEHOLDER =
  'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg';

function firstNonEmpty(...vals: Array<string | undefined | null>) {
  return vals.find(v => typeof v === 'string' && v.trim().length > 0) || '';
}

function getCover(field: any): string {
  const fromImages =
    Array.isArray(field?.images) && field.images.length > 0
      ? (typeof field.images[0] === 'string'
          ? field.images[0]
          : field.images[0]?.url) || ''
      : '';
  const fromPhotos =
    Array.isArray(field?.photos) && field.photos.length > 0
      ? field.photos[0]
      : '';
  return (
    firstNonEmpty(fromImages, fromPhotos, field?.image_url, field?.image) ||
    PLACEHOLDER
  );
}

function getSports(field: any): string[] {
  if (Array.isArray(field?.sports) && field.sports.length) return field.sports;
  if (typeof field?.type === 'string' && field.type.trim()) return [field.type];
  return [];
}

function getPrice(field: any): number | null {
  if (typeof field?.basePricePerHour === 'number') return field.basePricePerHour;
  if (typeof field?.price_per_session === 'number') return field.price_per_session;
  return null;
}

export function FieldCard({ field }: FieldCardProps) {
  const navigate = useNavigate();

  const cover = getCover(field);
  const sports = getSports(field);
  const price = getPrice(field);
  const locationText =
    (field as any).location_text || (field as any).location || '';
  const rating =
    typeof (field as any).rating === 'number' ? (field as any).rating : null;
  const openHour = (field as any).openHour;
  const closeHour = (field as any).closeHour;
  const nextAvailable = (field as any).nextAvailable as
    | { date?: string; start?: string }
    | undefined;

  const goToBooking = () => {
    // hard-navigate within SPA to /booking
    navigate('/booking');
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
      onClick={goToBooking}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToBooking();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Book ${field.name}`}
    >
      <div className="relative h-48">
        <img
          src={cover}
          alt={field.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
          loading="lazy"
        />
        {price !== null && (
          <div className="absolute top-4 right-4">
            <PriceBadge price={price} />
          </div>
        )}
        {sports.length > 0 && (
          <div
            className="absolute top-4 left-4 flex flex-wrap gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {sports.map((sport) => (
              <Badge
                key={sport}
                variant="primary"
                className="bg-white/90 text-indigo-600 capitalize"
              >
                {sport}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <CardContent onClick={(e) => e.stopPropagation()}>
        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">{field.name}</h3>

          {locationText && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{locationText}</span>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
            {rating !== null && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{rating}/5</span>
              </div>
            )}
            {openHour && closeHour && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{openHour} - {closeHour}</span>
              </div>
            )}
            {(field as any).surface && (
              <Badge variant="secondary" className="text-xs capitalize">
                {(field as any).surface}
              </Badge>
            )}
          </div>
        </div>

        {nextAvailable?.date && nextAvailable?.start && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                Next available: {nextAvailable.date} at {nextAvailable.start}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {(field as any).slots_left_today ? (
            <div className="text-sm text-gray-500">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {(field as any).slots_left_today} slots left today
              </span>
            </div>
          ) : <div />}

          <Button size="sm" onClick={goToBooking}>
            Reserve Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
