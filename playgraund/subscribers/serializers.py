from rest_framework import serializers
from .models import Subscribers

class SubscribersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscribers
        fields = [
            'id',
            'email',
            'created_at',
           
        ]

class SubscribersCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscribers
        fields = [
            'email',
        ]
        