from celery import shared_task
from .models import OverallStatusLog
from .utils import send_weather_email, send_sms


@shared_task
def check_and_send_weather_emails():
    logs = OverallStatusLog.objects.all()  # Add filters as necessary
    recipients = ['shimulpaul59@gmail.com',
                  'sayeed.swe@gmail.com']  # List of email recipients

    for log in logs:
        if log.overall_status == 'Good':
            subject = 'Weather Update: Good'
            message = f"The weather condition is good as of \
                {log.timestamp}."
        elif log.overall_status == 'Bad':
            subject = 'Weather Update: Bad'
            message = f"Alert! The weather condition is bad as of \
                {log.timestamp}."
        elif log.overall_status == 'Moderate':
            subject = 'Weather Update: Moderate'
            message = f"The weather condition is moderate as of \
                {log.timestamp}."
        else:
            continue

        send_weather_email(subject, message, recipients)

# Task for sending SMS


@shared_task
def check_and_send_weather_sms():
    logs = OverallStatusLog.objects.all()  # Add filters if necessary
    sms_recipients = ['+4915205835258', '+4917685959216']

    for log in logs:
        if log.overall_status == 'Good':
            message = f"The weather condition is GOOD as of \
                {log.timestamp}. Enjoy your day!"
        elif log.overall_status == 'Moderate':
            message = f"The weather condition is MODERATE as of \
                {log.timestamp}. Stay cautious!"
        elif log.overall_status == 'Bad':
            message = f"ALERT: The weather condition is BAD as of \
                {log.timestamp}. Stay safe!"
        else:
            continue

        for recipient in sms_recipients:
            send_sms(to=recipient, body=message)
