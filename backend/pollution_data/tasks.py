from celery import shared_task
from .models import OverallStatusLog
from .utils import send_weather_email


@shared_task
def check_and_send_weather_emails():
    logs = OverallStatusLog.objects.all()  # Add filters as necessary
    recipients = ['shimulpaul59@gmail.com',
                  'sayeed.swe@gmail.com']  # List of email recipients

    for log in logs:
        if log.overall_status == 'Good':
            subject = 'Weather Update: Good'
            message = f"The weather condition is good as of ."
        elif log.overall_status == 'Bad':
            subject = 'Weather Update: Bad'
            message = f"Alert! The weather condition is bad as of ."
        elif log.overall_status == 'Moderate':
            subject = 'Weather Update: Moderate'
            message = f"The weather condition is moderate as of ."
        else:
            continue

        send_weather_email(subject, message, recipients)
