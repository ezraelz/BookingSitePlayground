from rest_framework import serializers
from .models import Field

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = [
            'id',
            'name',
            'location',
            'price_per_hour',
            'is_active',
            'created_at'
        ]

class FieldCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = [
            'name',
            'location',
            'price_per_hour',
        ]
        