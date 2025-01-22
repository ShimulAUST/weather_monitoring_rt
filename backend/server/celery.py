from celery import Celery

app = Celery('server')

app.conf.beat_schedule = {
    'check-weather-every-hour': {
        'task': 'myapp.tasks.check_and_send_weather_emails',
        'schedule': 10.0,  # Every hour
    },
}
