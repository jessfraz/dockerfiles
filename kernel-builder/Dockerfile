FROM r.j3ss.co/wireguard:install
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	bash \
	bc \
	bison \
	ca-certificates \
	curl \
	fakeroot \
	flex \
	git \
	gmp-dev \
	libressl-dev \
	mpc1-dev \
	mpfr-dev \
	ncurses-dev \
	perl \
	tar \
	xz

ENV HOME /root
WORKDIR $HOME

ENV JOBS 4

COPY build_kernel /usr/local/bin/build_kernel

RUN echo "build_kernel [version]" > /root/.bash_history

ENTRYPOINT [ "bash" ]
