from django.db import models


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


    def __str__(self):
        return f"Pollution Data at {self.timestamp}"