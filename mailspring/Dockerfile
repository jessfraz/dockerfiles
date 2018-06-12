# docker run --namme mailspring -d 
# -v /tmp/.X11-unix:/tmp/.X11-unix 
# -e DISPLAY=$DISPLAY 
# --privileged 
# --net dev -v /:/host_drive  
# mailspring 

FROM centos:latest

RUN yum update && yum install -y \
    wget libXtst libxss1 \ 
    libXScrnSaver libsecret \
    libconfig-devel.x86_64 libappindicator lsb-core-noarch \
    GConf2 alsa-utils dbus-x11 gnome-keyring libgnome-keyring-devel && \
    wget https://github.com/Foundry376/Mailspring/releases/download/1.2.1/mailspring-1.2.1-0.1.x86_64.rpm && \
    rpm -i mailspring-1.2.1-0.1.x86_64.rpm && \
    rm -rf /var/lib/apt/lists/* && \
    dbus-uuidgen >/etc/machine-id 

ENTRYPOINT [ "mailspring" ]
