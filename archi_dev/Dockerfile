FROM store/oracle/jdk:11

ENV ARCHI_VERSION 4.6.0
ENV PATH $PATH:/opt/archi/

# the start files for archi use bash
RUN yum update -y
# RUN yum install -y oracle-softwarecollection-release-el7
RUN yum install -y tar
RUN yum install -y less
RUN yum install -y gtk2
RUN yum install -y libXtst
RUN yum install -y unzip
RUN yum install -y git
RUN yum install -y vim
RUN yum install -y gtk3

WORKDIR /etc/yum.repos.d
RUN curl -LJ0 http://yum.oracle.com/public-yum-ol7.repo | sed 's/enabled=0/enabled=1/' > public-yum-ol7.repo
# RUN yum update -y
RUN yum install -y xorg-x11-server-Xvfb

RUN echo "==> Downloading Archi..." \
        && mkdir -p /opt \
        && curl -LJ0 https://www.archimatetool.com/downloads/archive/4.6.0/Archi-Linux64-4.6.0.tgz | tar -vxzf - -C /opt

RUN echo "==> Downloading Eclipse..." \
        && mkdir -p /opt \
        && curl -LJ0 http://eclipse.mirror.rafal.ca/technology/epp/downloads/release/2019-09/R/eclipse-rcp-2019-09-R-linux-gtk-x86_64.tar.gz | tar -vxzf - -C /opt

RUN useradd -ms /bin/bash me
USER me
WORKDIR /home/me

CMD ["bash"]
