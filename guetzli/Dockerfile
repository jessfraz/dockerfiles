# guetzli
#
# docker run \
#			--rm \
#			-i \
#			-t \
#			-v ${PWD}:/tmp \
#			guetzli:latest \
#			--verbose /tmp/example.jpg /tmp/example.compressed.jpg

FROM alpine:latest
LABEL maintainer "Christian Koep <christian.koep@fom-net.de>"

ENV GUETZLI_VERSION v1.0.1
ENV APPDIR /usr/src/guetzli

RUN buildDeps=' \
                g++ \
                git \
                libpng-dev \
                make \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& git clone --depth 1 --branch ${GUETZLI_VERSION} https://github.com/google/guetzli.git ${APPDIR} \
	&& cd ${APPDIR} \
	&& make \
	&& apk del $buildDeps \
	&& mv ${APPDIR}/bin/Release/guetzli /usr/local/bin/guetzli && rm -rf ${APPDIR} \
	&& echo "Build complete."

RUN apk --no-cache add \
		libpng \
		libstdc++ \
		libgcc

ENTRYPOINT [ "/usr/local/bin/guetzli" ]
