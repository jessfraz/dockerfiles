FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	hicolor-icon-theme \
	firefox-esr \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY local.conf /etc/fonts/local.conf

ENTRYPOINT [ "firefox" ]
