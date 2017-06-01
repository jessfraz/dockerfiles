FROM debian:jessie

ENV HOME /home/app

RUN apt-get update && apt-get -y install --no-install-recommends \
    ca-certificates \
    curl \
    desktop-file-utils \
    libcairo2 \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libqt5core5a \
    libqt5gui5 \
    libx11-xcb1 \
    nano \
    shared-mime-info \
    xdg-utils \
	\
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p $HOME/.config/ParadigmaSoft/VStudio \
    && groupadd -r app \ 
    && useradd -r -g app -G audio,video app

RUN curl -L "http://www.valentina-db.com/en/studio/download/current/vstudio_x64_lin-deb?format=raw" -o vstudio_x64_7_lin.deb \
    && dpkg --install vstudio_x64_7_lin.deb \
    && chown -R app:app $HOME \
    && rm -f vstudio_x64_7_lin.deb

USER app

WORKDIR /home/app

ENTRYPOINT [ "/opt/VStudio/vstudio" ]
