FROM debian:wheezy
MAINTAINER Airton Zanon "airtonzanon@gmail.com"

RUN apt-get update && \
	apt-get install whois -y \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["whois"]
CMD ["--verbose"]
