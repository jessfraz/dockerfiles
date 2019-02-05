# docker run --rm \
#    --net host \
#    -v /tmp/.X11-unix:/tmp/.X11-unix \
#    -e DISPLAY="unix${DISPLAY}" \
#    --device /dev/snd:/dev/snd \
#    --device /dev/dri \
#    -v /dev/shm:/dev/shm \
#    -v "${HOME}/.aws:/home/aws/.aws" \
#    "westonsteimel/aws-ping-login" "$@"

FROM westonsteimel/debian:sid-slim as build

ENV AWS_PING_LOGIN_VERSION="master"

RUN apt-get update && apt-get install -y \
    python3.7-minimal \
    python3-setuptools \
    python3-pip \
    python3-wxgtk-webview4.0 \
    ca-certificates \
    git \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install --no-cache-dir "git+https://github.com/surfkansas/aws-ping-login@${AWS_PING_LOGIN_VERSION}" \
    && chmod a+x -R /usr/local/bin/ 

RUN groupadd -g 1000 aws && useradd --create-home --no-log-init -u 1000 -g aws aws

USER aws

ENTRYPOINT ["aws-ping-login"]
CMD ["--help"]
