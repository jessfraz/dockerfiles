FROM ubuntu:bionic

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libgfortran4 \
	libssl-dev \
	wget \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN wget https://gitlab.com/lulzbot3d/cura-le/cura-lulzbot/uploads/0676b39295476b93181fa8a512f34265/cura-lulzbot_3.2.21_amd64.deb -O /tmp/cura.deb \
	&& apt update \
	&& dpkg -i /tmp/cura.deb || true \
	&& apt-get -yf install \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /tmp/cura.deb

CMD ["cura-lulzbot"]
