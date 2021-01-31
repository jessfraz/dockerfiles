FROM mcr.microsoft.com/azure-cli:latest

ENV USER me
ENV HOME /home/$USER

RUN adduser -u 1000 -D $USER

WORKDIR $HOME
USER $USER

ENTRYPOINT	[ "bash" ]
