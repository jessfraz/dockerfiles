FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	kernel-package \
	make \
	libncurses5-dev \
	--no-install-recommends

ENV HOME /root
WORKDIR $HOME

ENV JOBS 2

# add install_kernel helper func
RUN { \
		echo '\ninstall_kernel(){'; \
		echo '\tlocal VERSION=$1'; \
		echo '\n\tif [[ -z $VERSION ]]; then'; \
		echo '\t\techo "Please specify a kernel version."'; \
		echo '\t\texit 1'; \
		echo '\tfi\n'; \
		echo '\tlocal MAJOR_VERSION=${VERSION:0:1}'; \
		echo '\n\t[ -d /usr/src/linux-${VERSION} ] || curl -sSL https://www.kernel.org/pub/linux/kernel/v${MAJOR_VERSION}.x/linux-${VERSION}.tar.xz | tar -v -C /usr/src -xJ'; \
		echo '\n\tcd /usr/src/linux-${VERSION}'; \
		echo '\n\tnice -19 make -j$JOBS KDEB_PKGVERSION=$PKGVERSION INSTALL_MOD_STRIP=1 deb-pkg'; \
		echo '}'; \
	} >> ~/.bashrc

CMD [ "bash" ]
