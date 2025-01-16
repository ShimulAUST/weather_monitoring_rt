from django.contrib import admin
from .models import PollutionData, OverallStatusLog


class PollutionDataAdmin(admin.ModelAdmin):
    list_display = (
        'timestamp',
        'temperature',
        'humidity',
        'air_quality',
        'gas_mq2',
        'gas_mq4',
        'dust',
    )

    list_filter = ('timestamp', 'air_quality', 'gas_mq2', 'gas_mq4', 'dust')
    search_fields = ('timestamp', 'air_quality', 'gas_mq2', 'gas_mq4')
    ordering = ('-timestamp',)

    # Make the air_quality_level method accessible in the admin
    def air_quality_level(self, obj):
        return obj.air_quality_level()
    air_quality_level.short_description = 'Air Quality Level'


# Register the model with the custom admin class
admin.site.register(PollutionData, PollutionDataAdmin)
admin.site.register(OverallStatusLog)
