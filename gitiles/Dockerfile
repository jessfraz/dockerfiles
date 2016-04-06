FROM java:8-alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk --update add \
	apache-ant \
	bash \
	git \
	perl \
	python \
	zip \
	--update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
	&& rm -rf /var/cache/apk/*

# install buck
RUN git clone --depth 1 https://github.com/facebook/buck.git /buck \
	&& cd /buck \
	&& ant \
	&& ln -snfv ${PWD}/bin/buck /usr/bin/buck

RUN git clone  --depth 1 --recurse-submodules https://gerrit.googlesource.com/gitiles /gitiles \
	&& cd /gitiles \
	&& touch .nobuckcheck \
	&& git submodule update --init \
	&& buck build all

COPY ./start.sh /start.sh

ENTRYPOINT [ "/start.sh" ]
