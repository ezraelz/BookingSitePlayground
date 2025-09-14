from rest_framework import serializers
from .models import Timeslot

class TimeslotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslot
        fields = [
            'id',
            'field',
            'start_time',
            'end_time',
            'date',
            'is_booked',
        ]

class TimeslotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslot
        fields = [
            'field',
            'start_time',
            'end_time',
            'is_booked'
        ]
        