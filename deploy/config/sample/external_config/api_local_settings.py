import os
from kombu import Exchange, Queue

PROJECT_HOME = os.path.realpath(os.path.join(os.path.dirname(__file__), ".."))

MEDIA_ROOT = "/opt/api/media"
BASE_WEB_URL = 'http://localhost:8000'

SECRET_KEY = '45323$^&^13wedgfdsERWE#@Rbvbhs$#$!~!UYYEwdgitredavnb4#$%^7jhgbq231254%&^UJNxsw34rbv%%V#xsd2ws#F45v56yu'

WEB_URL_BASE = "http://dev-ui-react-and-css-builder:3000"
PUPPETEER_BASE_URL = WEB_URL_BASE


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'imptime',
        'USER': 'dev',
        'PASSWORD': 'dev',
        'HOST': 'postgresql',
        'PORT': '5432',
    }
}

SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_TIMEOUT_MINUTES = 180

WINAGENT_SENTRY_URL="https://XXX:XXX@sentry.impd.co.za/xxx"

VERSION_NUMBER_FILEPATH = os.path.join(PROJECT_HOME, "..", "version.txt")
RAVEN_DSN='https://XXX:XXX@sentry.impd.co.za/xxx'
RAVEN_CONFIG = {
    'dsn': RAVEN_DSN,
    'release': open(VERSION_NUMBER_FILEPATH).read() if os.path.exists(VERSION_NUMBER_FILEPATH) else "Unknown"
}

CORS_ORIGIN_ALLOW_ALL = True
# CORS_ORIGIN_REGEX_WHITELIST = (r'^(https?://candidates\..*\.careerimptime.com.*$)',
#                                r'^(https?://clients\..*\.careerimptime.com.*$)')

DEBUG=True
ALLOWED_HOSTS = ['*']

REDIS_HOST='redis'
REDIS_PORT=6379
REDIS_DB=0

REDIS = {
    'HOST': REDIS_HOST,
    'PORT': REDIS_PORT,
    'DB': REDIS_DB
}

CHANNEL_LAYERS = {

    "default": {
        "BACKEND": "asgi_redis.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(REDIS_HOST, REDIS_PORT)],
        },
        "ROUTING": "impasync.routing.channel_routing",
    }
}


