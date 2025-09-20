# field/serializers.py
from rest_framework import serializers
from .models import Field

class FieldSerializer(serializers.ModelSerializer):
    # expose price_per_hour as a read-only alias of price_per_session
    price_per_hour = serializers.DecimalField(
        max_digits=12, decimal_places=2, source="price_per_session",
        read_only=True, required=False
    )

    class Meta:
        model = Field
        fields = [
            "id", "name", "type",
            "price_per_session",  # real DB column
            "price_per_hour",     # alias for frontends expecting it
            "is_active", "capacity",
        ]


class FieldCreateSerializer(serializers.ModelSerializer):
    # allow clients to send either price_per_session OR price_per_hour
    price_per_hour = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, write_only=True
    )

    class Meta:
        model = Field
        fields = [
            "id", "name", "type",
            "price_per_session", "price_per_hour",
            "is_active", "capacity",
        ]

    def validate(self, attrs):
        if attrs.get("price_per_session") is None and attrs.get("price_per_hour") is None:
            raise serializers.ValidationError("Provide either price_per_session or price_per_hour.")
        return attrs

    def _merge_hour_into_session(self, data):
        pph = data.pop("price_per_hour", None)
        if pph is not None and data.get("price_per_session") is None:
            data["price_per_session"] = pph
        return data

    def create(self, validated_data):
        validated_data = self._merge_hour_into_session(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._merge_hour_into_session(validated_data)
        return super().update(instance, validated_data)
