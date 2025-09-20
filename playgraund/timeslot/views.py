from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models.deletion import ProtectedError

from .models import Timeslot
from .serializers import TimeslotSerializer, TimeslotCreateUpdateSerializer

class TimeslotView(APIView):
    def get(self, request):
        qs = Timeslot.objects.all()
        return Response(TimeslotSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        ser = TimeslotCreateUpdateSerializer(data=request.data)
        if ser.is_valid():
            obj, _created = Timeslot.objects.get_or_create(
                start_time=ser.validated_data["start_time"],
                end_time=ser.validated_data["end_time"],
                defaults={"is_active": ser.validated_data.get("is_active", True)},
            )
            if not _created and "is_active" in ser.validated_data:
                obj.is_active = ser.validated_data["is_active"]
                obj.save(update_fields=["is_active"])
            return Response(TimeslotSerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class TimeslotDetailView(APIView):
    def put(self, request, pk):
        slot = get_object_or_404(Timeslot, pk=pk)
        ser = TimeslotCreateUpdateSerializer(slot, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(TimeslotSerializer(slot).data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        slot = get_object_or_404(Timeslot, pk=pk)
        try:
            slot.delete()
            return Response({"detail": "Timeslot deleted successfully."}, status=status.HTTP_200_OK)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete: this timeslot is used by existing bookings."},
                status=status.HTTP_409_CONFLICT,
            )
