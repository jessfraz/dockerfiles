FROM golang:alpine AS runc
ENV RUNC_VERSION 9f9c96235cc97674e935002fc3d78361b696a69e
RUN apk add --no-cache \
	bash \
	curl \
	g++ \
	git \
	libseccomp-dev \
	linux-headers \
	make
RUN git clone https://github.com/jessfraz/runc.git "$GOPATH/src/github.com/opencontainers/runc" \
	&& cd "$GOPATH/src/github.com/opencontainers/runc" \
	&& git checkout -q "demo-rootless" \
	&& make static BUILDTAGS="seccomp" EXTRA_FLAGS="-buildmode pie" EXTRA_LDFLAGS="-extldflags \\\"-fno-PIC -static\\\"" \
	&& mv runc /usr/bin/runc

FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@linux.com>
RUN apk add --no-cache \
	bash \
	shadow \
	shadow-uidmap \
	strace
COPY --from=runc /usr/bin/runc /usr/bin/runc
COPY start.sh /usr/bin/start.sh
ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user
COPY busybox.tar /home/user/busybox.tar
RUN chown -R user:user $HOME /run /tmp
USER user
WORKDIR $HOME

CMD ["start.sh"]
