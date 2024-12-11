from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from .models import PollutionData

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
