FROM google/golang
ENV DRONE_SERVER_PORT :80

RUN apt-get update && apt-get -y install \
    libsqlite3-dev \
    sqlite3 \
    zip \
    --no-install-recommends

RUN git clone https://github.com/drone/drone.git /gopath/src/github.com/drone/drone

WORKDIR /gopath/src/github.com/drone/drone

RUN make deps build test embed install

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/droned"]

CMD ["--config=/etc/drone/drone.toml"]
