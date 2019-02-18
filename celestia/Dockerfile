FROM westonsteimel/debian:sid-slim

RUN apt-get update -y \
    && apt-get install -y \
    cmake \
    make \
    g++ \
    libglew-dev \
    libjpeg-dev \
    libpng-dev \
    libtheora-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libgtk2.0-dev \
    libgtkglext1-dev \
    liblua5.3-dev \
    git \
    ca-certificates \
    --no-install-recommends

RUN git clone --depth 1 --recurse-submodules https://github.com/CelestiaProject/celestia

RUN cd celestia \
	&& cmake . -DENABLE_GTK=ON -DENABLE_QT=OFF \
	&& make \
    && make install \
    && apt-get autoremove -y \
    && apt-get autoclean -y \
    && apt-get clean -y \
    && rm -rf celestia \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["celestia-gtk"]
