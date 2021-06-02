FROM ubuntu:bionic

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libgfortran4 \
	libssl-dev \
	wget \
	--no-install-recommends

RUN wget https://gitlab.com/lulzbot3d/cura-le/cura-lulzbot/uploads/0676b39295476b93181fa8a512f34265/cura-lulzbot_3.2.21_amd64.deb -O /tmp/cura.deb \
	&& dpkg -i /tmp/cura.deb || true \
	&& apt-get -yf install \
	&& apt-get clean \
    	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

CMD ["cura-lulzbot"]
