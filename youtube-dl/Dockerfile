FROM python:3-alpine

RUN addgroup -g 1000 youtube-dl \
    && adduser -u 1000 -G youtube-dl -s /bin/sh -D youtube-dl

USER youtube-dl
ENV PATH "/home/youtube-dl/.local/bin:$PATH"
RUN pip install --user --no-cache-dir youtube-dl
WORKDIR /home/youtube-dl/Downloads

ENTRYPOINT ["youtube-dl"]
CMD ["--help"]

