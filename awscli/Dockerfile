FROM python:2.7.8
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN pip install awscli

RUN mkdir -p /root/.aws && /bin/echo -e '[default]\noutput = json\nregion = $AMAZON_REGION\naws_access_key_id = $AMAZON_ACCESS_KEY_ID\naws_secret_access_key = $AMAZON_SECRET_ACCESS_KEY' > /root/.aws/config

ENTRYPOINT [ "aws" ]
