# Run figma windows app in a container with wine
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	--cpuset-cpus 0 \
#	-v /tmp/.X11-unix:/tmp/.X11-unix  \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	--name figma-wine \
#	jess/figma-wine bash
#
FROM r.j3ss.co/wine
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ADD https://desktop.figma.com/win/FigmaSetup.exe /usr/src/FigmaSetup.exe

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& chown -R user:user $HOME \
	&& chown user:user /usr/src/FigmaSetup.exe

WORKDIR $HOME
USER user

RUN echo "wine /usr/src/FigmaSetup.exe" > /home/user/.bash_history
RUN echo "winetricks dotnet45" >> /home/user/.bash_history
RUN echo "winecfg" >> /home/user/.bash_history

CMD [ "bash" ]
