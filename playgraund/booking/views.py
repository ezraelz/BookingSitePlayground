from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from timeslot.models import Timeslot
from .serializers import  BookingAvailabilitySerializer
from datetime import datetime
from django.db.models import Sum
from django.utils.dateparse import parse_date
from datetime import timedelta, date
from django.db.models import Count
from rest_framework.decorators import api_view

@api_view(["GET"])
def bookings_stats(request):
    today = date.today()
    labels, values = [], []

    for i in range(6, -1, -1):  # Last 7 days
        day = today - timedelta(days=i)
        count = Booking.objects.filter(date=day).count()
        labels.append(day.strftime("%a"))  # Mon, Tue, etc
        values.append(count)

    return Response({"labels": labels, "values": values})

class BookingView(APIView):
    def get(self, request):
        booking = Booking.objects.all()
        serializer = BookingSerializer(booking, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BookingDetailView(APIView):
    def put(self, request, pk):
        booking = get_object_or_404(Booking, id=pk)
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        booking = get_object_or_404(Booking, id=pk)
        booking.delete()
        return Response('booking deleted successfully!')
    
class BookingAvailabilityView(APIView):
    def get(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {"error": "Date parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        time_slot = Timeslot.objects.all()
        serializer = BookingAvailabilitySerializer(
            time_slot,
            many=True,
            context={'date': date}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class BookingStatusView(APIView):
    def put(self, request, pk):
        booking = get_object_or_404(booking, id=pk)
        serializer = BookingSerializer(booking, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        booking = get_object_or_404(Booking, id=pk)
        booking.delete()
        return Response('booking deleted successfully!')
    
class Revenue(APIView):
    def get(self, request):
        month = request.GET.get("month")  # e.g., "2025-09"
        if not month:
            return Response({"error": "month parameter required (YYYY-MM)"}, status=400)

        year, month_num = month.split("-")
        total = (
            Booking.objects.filter(date__year=year, date__month=month_num, status="confirmed")
            .aggregate(total=Sum("playground__price_per_hour"))
            .get("total") or 0
        )
        return Response({"total": total})
    
# views.py
@api_view(["GET"])
def recent_activities(request):
    recent_bookings = Booking.objects.order_by("-id")[:5]  # latest 5 bookings
    activities = [
        {
            "id": b.id,
            "text": f"User {b.guest_name} booked {b.playground.name}",
            "time": b.date.strftime("%Y-%m-%d"),
        }
        for b in recent_bookings
    ]
    return Response(activities)
