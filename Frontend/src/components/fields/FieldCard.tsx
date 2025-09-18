import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge, PriceBadge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import type { FieldDTO } from '../../lib/types';

interface FieldCardProps {
  field: FieldDTO;
  onReserve: (field: FieldDTO) => void;
}

export function FieldCard({ field, onReserve }: FieldCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img
          src={field.images[0] || 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'}
          alt={field.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <PriceBadge price={field.basePricePerHour} />
        </div>
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {field.sports.map((sport) => (
            <Badge key={sport} variant="primary" className="bg-white/90 text-indigo-600">
              {sport === 'basketball' ? '🏀' : '⚽'} {sport}
            </Badge>
          ))}
        </div>
      </div>

      <CardContent>
        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">{field.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{field.location}</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{field.rating}/5</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{field.openHour} - {field.closeHour}</span>
            </div>
            {field.surface && (
              <Badge variant="secondary" className="text-xs">
                {field.surface}
              </Badge>
            )}
          </div>
        </div>

        {field.nextAvailable && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                Next available: {field.nextAvailable.date} at {field.nextAvailable.start}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              3 slots left today
            </span>
          </div>
          <Button onClick={() => onReserve(field)} size="sm">
            Reserve Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}