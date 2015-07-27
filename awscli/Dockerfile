FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	groff \
	python \
	py-pip \
	&& rm -rf /var/cache/apk/* \
	&& pip install awscli

RUN mkdir -p /root/.aws \
	&& /bin/echo -e '[default]\noutput = json\nregion = $AMAZON_REGION\naws_access_key_id = $AMAZON_ACCESS_KEY_ID\naws_secret_access_key = $AMAZON_SECRET_ACCESS_KEY' > /root/.aws/config

ENTRYPOINT [ "aws" ]
