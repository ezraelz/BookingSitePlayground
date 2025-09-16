from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Field
from .serializers import FieldSerializer, FieldCreateSerializer

class FieldView(APIView):
    def get(self, request):
        field = Field.objects.all()
        serializer = FieldSerializer(field, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = FieldCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FieldDetailView(APIView):
    def put(self, request, pk):
        field = get_object_or_404(Field, id=pk)
        serializer = FieldCreateSerializer(field, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        field = get_object_or_404(Field, id=pk)
        field.delete()
        return Response('Field deleted successfully!')
    

