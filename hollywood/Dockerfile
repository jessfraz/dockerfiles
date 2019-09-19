# Run Hollywood in a container
#
#  docker run --rm -it \
#    --name hollywood \
#    jess/hollywood
#
# To easily exit, use "F6" which will disconnect from the Byobu
# session and exit the container.
#
FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	software-properties-common \
	--no-install-recommends && \
	apt-get update && \
	apt-get install -y \
	byobu \
	hollywood \
	mlocate \
	tree \
	apg \
	bmon \
	bsdmainutils \
	ccze \
	cmatrix \
	htop \
	jp2a \
	moreutils \
	speedometer \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& updatedb

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& chown -R user:user $HOME

WORKDIR $HOME
USER user

CMD [ "hollywood" ]
