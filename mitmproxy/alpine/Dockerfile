# mitmproxy
# docker run --rm -it -v ~/.mitmproxy:/home/mitmproxy/.mitmproxy -p 8080:8080 mitmproxy/mitmproxy
#
# mitmweb
# docker run --rm -it -p 8080:8080 -p 127.0.0.1:8081:8081 mitmproxy/mitmproxy mitmweb --web-iface 0.0.0.0
#

FROM python:3-alpine

ENV LANG=en_US.UTF-8
ENV MITMPROXY_VERSION 4.0.4

RUN addgroup -g 1000 mitmproxy \
    && adduser -u 1000 -G mitmproxy -D mitmproxy \
    && apk --no-cache add \
        ca-certificates \
        libffi \
        openssl \
    && apk --no-cache add --virtual .build-dependencies \
        build-base \
        git \
        libffi-dev \
        openssl-dev \
	&& git clone --branch="v${MITMPROXY_VERSION}" --depth=1 https://github.com/mitmproxy/mitmproxy \
	&& cd mitmproxy \
	&& python setup.py bdist_wheel \
    && LDFAGS=-L/lib pip install dist/mitmproxy-${MITMPROXY_VERSION}-py3-none-any.whl \
    && apk del --purge .build-dependencies \
    && cd .. \
    && rm -rf ~/.cache/pip mitmproxy /var/cache/* \

USER mitmproxy

EXPOSE 8080 8081

CMD ["mitmproxy"]
