FROM debian:latest

RUN apt-get update -y && \
    apt-get install -y gnupg2 \
    kdesudo && \ 
    echo "deb http://dl.bintray.com/resin-io/debian stable etcher" \
    | tee /etc/apt/sources.list.d/etcher.list && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 379CE192D401AB61 && \
    apt-get update -y && \
    apt-get install -y etcher-electron

CMD ["etcher-electron"]
