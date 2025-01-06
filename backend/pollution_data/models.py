from django.db import models

from django.contrib.postgres.fields import JSONField


class PollutionData(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)

    # For DHT22 sensor
    temperature = models.FloatField(help_text="Temperature in °C")  # °C
    humidity = models.FloatField(help_text="Humidity in %")         # %

    # For MQ135 sensor
    air_quality = models.IntegerField(
        help_text="Air Quality Index (AQI) from MQ135 sensor"
    )

    # For MQ2 sensor
    gas_mq2 = models.IntegerField(
        help_text="Gas concentration (LPG, methane, smoke) from MQ2 sensor in ppm"
    )

    # For MQ4 sensor
    gas_mq4 = models.IntegerField(
        help_text="Methane gas concentration from MQ4 sensor in ppm"
    )

    # For Shinyei PPD42 sensor
    dust = models.FloatField(
        help_text="Dust concentration in µg/m³ from PPD42 sensor"
    )

    # For admin page

    def __str__(self):
        return f"Pollution Data at {self.timestamp}"


class OverallStatusLog(models.Model):
    timestamp = models.DateTimeField()
    overall_status = models.CharField(max_length=10)
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    air_quality = models.FloatField(null=True, blank=True)
    gas_mq2 = models.FloatField(null=True, blank=True)
    gas_mq4 = models.FloatField(null=True, blank=True)
    dust = models.FloatField(null=True, blank=True)
    # To store quality as JSON
    quality_status = JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.timestamp} - {self.overall_status}"
