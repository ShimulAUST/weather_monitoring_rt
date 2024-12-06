from django.db import models


class PollutionData(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    humidity = models.FloatField()
    air_quality = models.FloatField()
    gas_mq2 = models.FloatField()
    gas_mq4 = models.FloatField()
    pm25 = models.FloatField()
    pm10 = models.FloatField()

    def __str__(self):
        return f"Data at {self.timestamp}"
