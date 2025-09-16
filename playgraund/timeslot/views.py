from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Timeslot
from .serializers import TimeslotCreateSerializer, TimeslotSerializer


class TimeslotView(APIView):
    def get(self, request):
        timeslot = Timeslot.objects.all()
        serializer = TimeslotSerializer(timeslot, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = TimeslotCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TimeslotDetailView(APIView):
    def put(self, request, pk):
        timeslot = get_object_or_404(Timeslot, id=pk)
        serializer = TimeslotCreateSerializer(Timeslot, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, staus=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        timeslot = get_object_or_404(Timeslot, id=pk)
        timeslot.delete()
        return Response('timeslot deleted successfuly!')
    
