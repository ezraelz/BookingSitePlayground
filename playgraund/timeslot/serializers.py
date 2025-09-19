# timeslot/serializers.py
from rest_framework import serializers
from .models import Timeslot

class TimeslotSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    sequence = serializers.SerializerMethodField()

    class Meta:
        model = Timeslot
        fields = ["id", "label", "start_time", "end_time", "is_active", "sequence"]
        read_only_fields = ["label", "sequence"]

    def get_label(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"

    def get_sequence(self, obj):
        return obj.start_time.hour * 60 + obj.start_time.minute


class TimeslotCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeslot
        fields = ["start_time", "end_time", "is_active"]

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError("end_time must be after start_time.")
        return attrs
