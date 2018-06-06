FROM fedora:latest
RUN dnf install nautilus -y

ENV LANG en-US

COPY local.conf /etc/fonts/local.conf

ENTRYPOINT [ "/usr/bin/nautilus" ]
