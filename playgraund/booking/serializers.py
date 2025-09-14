from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'guest_name',
            'guest_email',
            'guest_phone'
            'playground',
            'time_slot',
            'status',
            'created_at',
        ]

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'user',
            'guest_name',
            'guest_email',
            'guest_phone'
            'playground',
            'time_slot',
            'status',
        ]
        