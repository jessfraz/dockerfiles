import os.path
import os

CONF_ROOT = os.path.dirname(__file__)

database_name = os.environ.get('SENTRY_NAME', 'sentry')
database_user = os.environ.get('SENTRY_USER', 'sentry')
database_password = os.environ.get('SENTRY_PASS', 'sentry')
database_host = os.environ.get('SENTRY_HOST', '127.0.0.1')
database_port = os.environ.get('SENTRY_PORT', '')

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('SENTRY_ENGINE', 'django.db.backends.sqlite3'),  # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': database_name,                      # Or path to database file if using sqlite3.
        'USER': database_user,                      # Not used with sqlite3.
        'PASSWORD': database_password,                  # Not used with sqlite3.
        'HOST': database_host,                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': database_port,                      # Set to empty string for default. Not used with sqlite3.
    }
}

SENTRY_KEY = os.environ.get('SENTRY_KEY', '333dkdslyvBUGWq5bcnW9d1MZQ82qmPZB4pskKS3223fdBfuhySw==')

# Set this to false to require authentication
SENTRY_PUBLIC = False

# You should configure the absolute URI to Sentry. It will attempt to guess it if you don't
# but proxies may interfere with this.
# SENTRY_URL_PREFIX = 'http://sentry.example.com'  # No trailing slash!

SENTRY_WEB_HOST = '0.0.0.0'
SENTRY_WEB_PORT = 9000
SENTRY_WEB_OPTIONS = {
    'workers': 3,  # the number of gunicorn workers
}

# Mail server configuration

# For more information check Django's documentation:
#  https://docs.djangoproject.com/en/1.3/topics/email/?from=olddocs#e-mail-backends

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

EMAIL_HOST = 'localhost'
EMAIL_HOST_PASSWORD = ''
EMAIL_HOST_USER = ''
EMAIL_PORT = 25
EMAIL_USE_TLS = False

# http://twitter.com/apps/new
# It's important that input a callback URL, even if its useless. We have no idea why, consult Twitter.
TWITTER_CONSUMER_KEY = ''
TWITTER_CONSUMER_SECRET = ''

# http://developers.facebook.com/setup/
FACEBOOK_APP_ID = ''
FACEBOOK_API_SECRET = ''

# http://code.google.com/apis/accounts/docs/OAuth2.html#Registering
GOOGLE_OAUTH2_CLIENT_ID = ''
GOOGLE_OAUTH2_CLIENT_SECRET = ''

# https://github.com/settings/applications/new
GITHUB_APP_ID = ''
GITHUB_API_SECRET = ''

# https://trello.com/1/appKey/generate
TRELLO_API_KEY = ''
TRELLO_API_SECRET = ''
