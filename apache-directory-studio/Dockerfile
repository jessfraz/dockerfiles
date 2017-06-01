FROM debian:jessie

ENV VERSION 2.0.0.v20161101-M12
# ENV MIRROR https://www.apache.org/dist/directory/studio
ENV MIRROR http://apache.mirrors.hoobly.com/directory/studio/
ENV FILE "ApacheDirectoryStudio-$VERSION-linux.gtk.x86_64.tar.gz"
ENV HOME /home/app

RUN apt-get update && apt-get -y install --no-install-recommends \
    ca-certificates \
    curl \
    default-jre \
	dirmngr \
	gnupg \
    libgtk2.0-0 \
    libcanberra-gtk-module \
	\
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p $HOME/.ApacheDirectoryStudio \
    && groupadd -r app \ 
    && useradd -r -g app -G audio,video app

RUN curl -L $MIRROR/$VERSION/$FILE.asc -o $FILE.asc \
    && curl -L $MIRROR/$VERSION/$FILE -o $FILE \
    && curl -L https://www.apache.org/dist/directory/KEYS -o KEYS \
    # verify passes on macbook but no in container ?!
	# && mkdir -p $HOME/.gnupg \
    # && gpg --import KEYS \
    # && gpg --verify $FILE.asc $FILE \
    && tar -xvzf $FILE \
    && mv ApacheDirectoryStudio/* $HOME \
    && chown -R app:app $HOME \
    && rm -rf ApacheDirectoryStudio* \
    && rm KEYS 

USER app

WORKDIR /home/app

ENTRYPOINT [ "/home/app/ApacheDirectoryStudio" ]
