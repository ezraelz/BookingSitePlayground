from rest_framework import serializers
from .models import Booking
from field.models import Field
from timeslot.models import Timeslot
from field.serializers import FieldSerializer
from timeslot.serializers import TimeslotSerializer

class BookingSerializer(serializers.ModelSerializer):
    playground = FieldSerializer()
    time_slot = TimeslotSerializer()
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'guest_name',
            'guest_email',
            'guest_phone',
            'playground',
            'time_slot',
            'date',
            'duration',
            'status',
            'created_at',
            'is_paid',
        ]

class BookingCreateSerializer(serializers.ModelSerializer):
    playground = serializers.PrimaryKeyRelatedField(queryset=Field.objects.all(), write_only=True, required=False)
    time_slot = serializers.PrimaryKeyRelatedField(queryset=Timeslot.objects.all(), write_only=True, required=False)
    class Meta:
        model = Booking
        fields = [
            'guest_name',
            'guest_email',
            'guest_phone',
            'playground',
            'duration',
            'date',
            'time_slot',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

    
class BookingAvailabilitySerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        # obj is a TimeSlot instance passed with context
        date = self.context.get('date')
        if not date:
            return 'available'
        # Check if a booking exists for this timeslot and date
        booking_exists = Booking.objects.filter(
            time_slot=obj,
            date=date,
            is_booked=True
        ).exists()
        return 'booked' if booking_exists else 'available'