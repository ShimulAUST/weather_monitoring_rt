from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client


def send_weather_email(subject, message, recipient_list):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        recipient_list,
        fail_silently=False,  # Set to True to suppress errors
    )


def send_sms(to, body):
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_ = settings.TWILIO_PHONE_NUMBER

    client = Client(account_sid, auth_token)

    try:
        message = client.messages.create(
            body=body,
            from_=from_,
            to=to
        )
        print(f"Message sent successfully to {to}. SID: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"Failed to send SMS to {to}: {e}")
        return None
