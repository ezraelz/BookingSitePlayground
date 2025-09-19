from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Field
from .serializers import FieldSerializer, FieldCreateSerializer


class FieldView(APIView):
    """
    GET  /fields/   -> list
    POST /fields/   -> create
    Optional filter: ?is_active=true|false
    """
    def get(self, request):
        qs = Field.objects.all()

        is_active = request.query_params.get("is_active")
        if is_active is not None:
            val = str(is_active).lower()
            if val in ("1", "true", "yes"):
                qs = qs.filter(is_active=True)
            elif val in ("0", "false", "no"):
                qs = qs.filter(is_active=False)

        return Response(FieldSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        ser = FieldCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        # return read serializer so clients also get the price_per_hour alias, etc.
        return Response(FieldSerializer(obj).data, status=status.HTTP_201_CREATED)


class FieldDetailView(APIView):
    """
    GET    /fields/<pk>/ -> retrieve
    PUT    /fields/<pk>/ -> full update
    PATCH  /fields/<pk>/ -> partial update
    DELETE /fields/<pk>/ -> delete
    """
    def get(self, request, pk):
        obj = get_object_or_404(Field, pk=pk)
        return Response(FieldSerializer(obj).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        obj = get_object_or_404(Field, pk=pk)
        ser = FieldCreateSerializer(instance=obj, data=request.data, partial=False)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        return Response(FieldSerializer(obj).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        obj = get_object_or_404(Field, pk=pk)
        ser = FieldCreateSerializer(instance=obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        return Response(FieldSerializer(obj).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        obj = get_object_or_404(Field, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
