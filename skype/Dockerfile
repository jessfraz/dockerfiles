# Run skype in a container
#
# docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#     -v /dev/snd:/dev/snd \
#     -e DISPLAY=unix$DISPLAY \
#     jess/skype
#
FROM debian:jessie

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

# Setup multiarch because Skype is 32bit only
# Make sure the repository information is up to date
RUN dpkg --add-architecture i386 && \
    apt-get update && apt-get install -y \
    curl \
    --no-install-recommends


# Install Skype
RUN curl http://download.skype.com/linux/skype-debian_4.3.0.37-1_i386.deb > /usr/src/skype.deb && \ 
    dpkg -i /usr/src/skype.deb || true && \
    apt-get install -fy

# Start Skype
ENTRYPOINT ["skype"]
