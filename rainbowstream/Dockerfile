# Run Rainbowstream in a container
#
#        docker run -it --rm \
#                -v /etc/localtime:/etc/localtime \
#                -v $HOME/.rainbow_oauth:/root/.rainbow_oauth \ # mount config files
#                -v $HOME/.rainbow_config.json:/root/.rainbow_config.json \
#                --name rainbowstream \
#                jess/rainbowstream
#
FROM python:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libjpeg-dev \
	libfreetype6 \
	libfreetype6-dev \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install rainbowstream

ENTRYPOINT [ "rainbowstream" ]
