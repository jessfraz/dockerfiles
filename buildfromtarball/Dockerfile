FROM docker

RUN apk install --no-cache \
	bash \
	ca-certificates \
	curl \
	tar

COPY build.sh /usr/local/bin/build

ENTRYPOINT ["build"]
