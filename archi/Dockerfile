FROM oraclelinux:8.2

ENV ARCHI_VERSION 4.6.0
ENV PATH $PATH:/opt/archi/

# the start files for archi use bash
RUN yum update -y
# RUN yum install -y oracle-softwarecollection-release-el8
RUN yum install -y tar
RUN yum install -y less
RUN yum install -y gtk2
RUN yum install -y libXtst
RUN yum install -y unzip
RUN yum install -y git
RUN yum install -y vim
RUN yum install -y gtk3

RUN yum install -y xorg-x11-server-Xvfb

RUN echo "==> Downloading Archi..." \
        && mkdir -p /opt \
        && curl -LJ0 https://www.archimatetool.com/downloads/archive/4.6.0/Archi-Linux64-4.6.0.tgz | tar -vxzf - -C /opt

CMD ["/opt/archi/Archi"]
