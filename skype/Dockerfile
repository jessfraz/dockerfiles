FROM debian:jessie

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

# Setup multiarch because Skype is 32bit only
RUN dpkg --add-architecture i386

# Make sure the repository information is up to date
RUN apt-get update && apt-get install -y \
    curl \
    libpulse0:i386 \
    openssh-server \
    pulseaudio:i386 \
    --no-install-recommends


# Install Skype
RUN curl http://download.skype.com/linux/skype-debian_4.3.0.37-1_i386.deb > /usr/src/skype.deb && \ 
    dpkg -i /usr/src/skype.deb || true && \
    apt-get install -fy

# Create user skype
RUN useradd -m -d /home/skype skype
RUN echo "skype:skype" | chpasswd

# Create OpenSSH privilege separation directory, enable X11Forwarding
RUN mkdir -p /var/run/sshd && \
    echo 'X11Forwarding yes' >> /etc/ssh/ssh_config

# Prepare ssh config folder so we can upload SSH public key later
RUN mkdir /home/skype/.ssh && \
    chown -R skype:skype /home/skype && \
    chown -R skype:skype /home/skype/.ssh

# Set locale (fix locale warnings)
RUN localedef -v -c -i en_US -f UTF-8 en_US.UTF-8 || true && \
    echo "America/Los_Angeles" > /etc/timezone

# Set up the launch wrapper - sets up PulseAudio to work correctly
RUN echo 'export PULSE_SERVER="tcp:localhost:64713"' >> /usr/local/bin/skype-pulseaudio && \
    echo 'PULSE_LATENCY_MSEC=60 skype' >> /usr/local/bin/skype-pulseaudio && \
    chmod 755 /usr/local/bin/skype-pulseaudio

# Expose the SSH port
EXPOSE 22

# Start SSH
ENTRYPOINT ["/usr/sbin/sshd",  "-D"]
