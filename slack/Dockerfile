FROM debian:stretch-slim
LABEL github "https://github.com/mrorgues"


#============================#
# Information & Requirements #
#============================#
# *** Run slack desktop app in a container ***
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/dri \
#	--device /dev/snd \
#	--device /dev/video0 \
#	--group-add audio \
#	--group-add video \
#	-v "${HOME}/.slack:/root/.config/Slack" \
#	--ipc="host" \
#	--name slack \
#	mrorgues/slack 


#=================#
# Basics & Locale #
#=================#
ENV DEFAULT_LANGUAGE en_US
ENV LANGUAGE ${DEFAULT_LANGUAGE}".UTF-8"
ENV LC_ALL ${DEFAULT_LANGUAGE}".UTF-8"
ENV LANG ${DEFAULT_LANGUAGE}".UTF-8"
ENV LOCALE_GEN ${DEFAULT_LANGUAGE}".UTF-8 UTF-8"
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    gconf2 \
    gconf-service \
    gir1.2-gnomekeyring-1.0 \
    gvfs-bin \
    hunspell-en-us \
    libappindicator1 \
    libasound2 \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    libgnome-keyring0 \
    libgtk2.0-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    locales \
    python \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    touch /usr/share/locale/locale.alias && \
    localedef -i ${DEFAULT_LANGUAGE} -c -f UTF-8 -A /usr/share/locale/locale.alias ${LC_ALL} && \
    echo ${LOCALE_GEN} >> /etc/locale.gen && \
    locale-gen && \
    /usr/sbin/update-locale LANG=${LANG}


#=======#
# Slack #
#=======#
ENV SLACK_VERSION 2.1.1
ENV SLACK_DOWNLOAD_URL https://downloads.slack-edge.com/linux_releases/slack-desktop-${SLACK_VERSION}-amd64.deb
RUN buildDeps='curl' && \
    set -x && \
    apt-get update && apt-get install -y $buildDeps --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    curl -sSL "${SLACK_DOWNLOAD_URL}" > /tmp/slack-desktop.deb && \
    dpkg -i /tmp/slack-desktop.deb && \
    rm -rf /tmp/slack-desktop.deb && \
    apt-get purge -y --auto-remove $buildDeps


#=============#
# Here we go! #
#=============#
ENTRYPOINT ["/usr/lib/slack/slack"]
