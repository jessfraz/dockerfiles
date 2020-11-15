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

# WORKDIR /etc/yum.repos.d
# RUN curl -LJ0 http://yum.oracle.com/public-yum-ol8.repo
# RUN yum-config-manager --enable ol8_optional_developer
# RUN yum update -y
RUN yum install -y xorg-x11-server-Xvfb

# RUN buildDeps=' \
#                 curl \
#                 tar \
#                 unzip \
#                 git \
#         ' \
#         && echo "==> Installing dependencies..." \
#         && apk --no-cache add --virtual build-deps $buildDeps \
# RUN echo "==> Downloading Archi..." \
#         && mkdir -p /opt \
#         && curl -LJ0 https://codeload.github.com/archimatetool/archi/tar.gz/release_${ARCHI_VERSION} | tar -vxzf - -C /opt \
#         && mv /opt/archi-release_${ARCHI_VERSION} /opt/archi

RUN echo "==> Downloading Archi..." \
        && mkdir -p /opt \
        && curl -LJ0 https://www.archimatetool.com/downloads/78ef89ac08f/Archi-Linux64-4.6.0.tgz | tar -vxzf - -C /opt
#        && mv /opt/archi-release_${ARCHI_VERSION} /opt/archi
#       && apk del build-deps
#       && apk del build-deps

CMD ["/opt/archi/Archi"]
