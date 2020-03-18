FROM java:8-alpine

ENV ARCHI_VERSION 4.4.0
ENV PATH $PATH:/opt/archi/

# the start files for archi use bash
RUN apk --no-cache add \
        bash 
RUN apk --no-cache add gtk+2.0
RUN apk --no-cache add libxtst
RUN apk --no-cache add xvfb

RUN buildDeps=' \
                curl \
                tar \
                unzip \
                git \
        ' \
        && echo "==> Installing dependencies..." \
        && apk --no-cache add --virtual build-deps $buildDeps \
        && echo "==> Downloading Archi..." \
        && mkdir -p /opt \
        && curl -LJ0 https://codeload.github.com/archimatetool/archi/tar.gz/release_${ARCHI_VERSION} | tar -vxzf - -C /opt \
        && mv /opt/archi-release_${ARCHI_VERSION} /opt/archi 
#       && apk del build-deps

CMD ["/opt/archi/Archi"]
