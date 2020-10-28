# Run awscli in a container and list s3 buckets
#
# docker run --rm -it \
#	--name awscli \
#	jess/awscli \
#       s3 ls
#

FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	ca-certificates \
	groff \
	less \
	python3 \
	&& pip3 install awscli \
	&& mkdir -p /root/.aws \
	&& { \
		echo '[default]'; \
		echo 'output = json'; \
		echo 'region = $AWS_DEFAULT_REGION'; \
		echo 'aws_access_key_id = $AMAZON_ACCESS_KEY_ID'; \
		echo 'aws_secret_access_key = $AMAZON_SECRET_ACCESS_KEY'; \
	} > /root/.aws/config

ENTRYPOINT [ "aws" ]
