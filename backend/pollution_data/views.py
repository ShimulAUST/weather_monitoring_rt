from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PollutionData
from .serializers import PollutionDataSerializer


class PollutionDataView(APIView):
    def post(self, request):
        serializer = PollutionDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Data saved successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
