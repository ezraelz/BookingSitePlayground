from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from datetime import datetime, date, timedelta
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingAvailabilitySerializer
from timeslot.models import Timeslot
from field.models import Field
from field.serializers import FieldSerializer
from users.models import Profile

@api_view(["GET"])
def bookings_stats(request):
    today = date.today()
    labels, values = [], []

    for i in range(6, -1, -1):  # Last 7 days
        day = today - timedelta(days=i)
        count = Booking.objects.filter(date=day).count()
        labels.append(day.strftime("%a"))  # Mon, Tue, etc
        values.append(count)

    return Response({"labels": labels, "values": values}, status=status.HTTP_200_OK)

@api_view(["GET"])
def recent_activities(request):
    recent_bookings = Booking.objects.order_by("-id")[:5]  # Latest 5 bookings
    activities = [
        {
            "id": b.id,
            "text": f"User {b.guest_name} booked {b.playground.name}",
            "time": b.date.strftime("%Y-%m-%d"),
        }
        for b in recent_bookings
    ]
    return Response(activities, status=status.HTTP_200_OK)

class BookingView(APIView):
    def get(self, request):
        bookings = Booking.objects.all()
        serializer = BookingSerializer(bookings, many=True)
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
        return Response({"message": "Booking deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class BookingAvailabilityView(APIView):
    def get(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {"error": "Date parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        date = parse_date(date_str)
        if not date:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        time_slots = Timeslot.objects.all()
        serializer = BookingAvailabilitySerializer(
            time_slots,
            many=True,
            context={'date': date}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

class BookingStatusView(APIView):
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
        return Response({"message": "Booking deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class Revenue(APIView):
    def get(self, request):
        month = request.GET.get("month")  # e.g., "2025-09"
        if not month:
            return Response({"error": "Month parameter required (YYYY-MM)"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            year, month_num = month.split("-")
            year, month_num = int(year), int(month_num)
            datetime(year, month_num, 1)  # Validate year and month
        except (ValueError, TypeError):
            return Response({"error": "Invalid month format. Use YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)

        total = (
            Booking.objects.filter(date__year=year, date__month=month_num, status="confirmed")
            .aggregate(total=Sum("playground__price_per_hour"))
            .get("total") or 0
        )
        return Response({"total": total}, status=status.HTTP_200_OK)

class BookingsPermonth(APIView):
    def get(self, request):
        # Get the year from query parameters, default to current year if not provided
        year = request.query_params.get('year', datetime.now().year)
        try:
            year = int(year)
        except ValueError:
            return Response(
                {"error": "Invalid year format. Use YYYY"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize lists for labels (month names) and values (booking counts)
        labels = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]
        values = []

        # Count bookings for each month in the specified year
        for month in range(1, 13):
            count = Booking.objects.filter(
                date__year=year,
                date__month=month
            ).count()
            values.append(count)

        return Response({"months": labels, "values": values}, status=status.HTTP_200_OK)
    

class RevenuePerPlayground(APIView):
    def get(self, request):
        playgrounds = Field.objects.all()
        labels, values = [], []

        # Calculate revenue for each playground
        for playground in playgrounds:
            total_revenue = (
                Booking.objects.filter(playground=playground)
                .aggregate(total=Sum("playground__price_per_hour"))
                .get("total") or 0
            )
            labels.append(playground.name)
            values.append(total_revenue)

        return Response({"labels": labels, "values": values}, status=status.HTTP_200_OK)
    
class BookingsPerUser(APIView):
    def get(self, request):
        booking_counts = (
            Booking.objects.filter()
            .values('guest_name')
            .annotate(total=Count('id'))
            .order_by('guest_name')
        )

        # Prepare response data
        labels = [booking['guest_name'] for booking in booking_counts]
        values = [booking['total'] for booking in booking_counts]

        return Response({"labels": labels, "values": values}, status=status.HTTP_200_OK)