from rest_framework import serializers
from .models import PollutionData


class PollutionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollutionData
        fields = '__all__'
