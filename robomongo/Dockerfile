FROM debian:jessie

ENV HOME /home/app

RUN apt-get update && apt-get -y install --no-install-recommends \
    ca-certificates \
    curl \
    libglib2.0-0 \
	libgl1-mesa-glx \
    libqt5gui5 \
    libx11-xcb1 \
	\
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p $HOME/.config/robomongo \
    && groupadd -r app \ 
    && useradd -r -g app -G audio,video app

RUN curl -L "https://download.robomongo.org/1.0.0-rc1/linux/robomongo-1.0.0-rc1-linux-x86_64-496f5c2.tar.gz" -o robomongo.tar.gz \
    && tar -xvzf robomongo.tar.gz \
    && mv robomongo-1.0.0-rc1-linux-x86_64-496f5c2/* $HOME \
    && chown -R app:app $HOME \
    && rm -rf robomongo* \
    && ls -al

USER app

WORKDIR /home/app

ENTRYPOINT [ "/home/app/bin/robomongo" ]
