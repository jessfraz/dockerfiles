FROM python:3-alpine
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	bash

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		libffi-dev \
		openssl-dev \
	&& pip install --upgrade \
		--pre azure-cli \
		--extra-index-url https://azurecliprod.blob.core.windows.net/edge \
		--no-cache-dir \
	&& apk del .build-deps

# Add extentions
ENV AZURE_CLI_EXTENSION_NOELBUNDICK_VERSION 0.0.10
RUN az extension add -y \
	--source "https://github.com/noelbundick/azure-cli-extension-noelbundick/releases/download/v${AZURE_CLI_EXTENSION_NOELBUNDICK_VERSION}/noelbundick-${AZURE_CLI_EXTENSION_NOELBUNDICK_VERSION}-py2.py3-none-any.whl"

ENTRYPOINT	[ "az" ]
