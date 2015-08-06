# Run glances in a container
# https://github.com/nicolargo/glances
#
# docker run --rm -it \
# --pid host \
# --ipc host \
# --net host \
# --privileged \
# --name glances \
# infoslack/glances

FROM python:latest
MAINTAINER Daniel Romero <infoslack@gmail.com>

ENV VERSION 2.4.2
RUN curl -L "https://github.com/nicolargo/glances/archive/v${VERSION}.tar.gz" \
  -o glances.tar.gz \
  && tar -zxvf glances.tar.gz

WORKDIR glances-$VERSION
RUN python setup.py install

CMD [ "glances" ]
