from rest_framework import serializers
from .models import Booking
from field.models import Field
from timeslot.models import Timeslot

class BookingSerializer(serializers.ModelSerializer):
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

    
        