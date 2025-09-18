from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from timeslot.models import Timeslot
from .serializers import  BookingAvailabilitySerializer
from datetime import datetime

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
    
