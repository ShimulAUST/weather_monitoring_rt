from .models import OverallStatusLog
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from .models import PollutionData
from django.core.mail import send_mail


@method_decorator(csrf_exempt, name='dispatch')
class PollutionDataView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body.decode('utf-8'))
            pollution_entry = PollutionData.objects.create(
                temperature=data.get('temperature'),
                humidity=data.get('humidity'),
                air_quality=data.get('air_quality'),
                gas_mq2=data.get('gas_mq2'),
                gas_mq4=data.get('gas_mq4'),
                dust=data.get('dust'),
            )
            pollution_entry.save()
            return JsonResponse({'message': 'Data saved successfully!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    def get(self, request, *args, **kwargs):
        # Retrieve and display data ordered by timestamp in descending order
        data = PollutionData.objects.all().order_by('-timestamp').values()
        return JsonResponse(list(data), safe=False)


@csrf_exempt
def save_status(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            timestamp = data.get("timestamp")
            overall_status = data.get("overall_status")
            averages = data.get("averages", {})
            quality = data.get("quality", {})

            # Check if the overall_status is already logged
            last_log = OverallStatusLog.objects.last()
            if last_log and last_log.overall_status == overall_status:
                return JsonResponse({"message": "Status unchanged. No new entry created."}, status=200)

            # Save the new status
            log = OverallStatusLog(
                timestamp=timestamp,
                overall_status=overall_status,
                temperature=averages.get("temperature"),
                humidity=averages.get("humidity"),
                air_quality=averages.get("air_quality"),
                gas_mq2=averages.get("gas_mq2"),
                gas_mq4=averages.get("gas_mq4"),
                dust=averages.get("dust"),
                quality_status=quality,
            )
            log.save()

            return JsonResponse({"message": "Status saved successfully."}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"message": "Invalid request method."}, status=405)
