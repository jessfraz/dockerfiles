FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    debhelper \
    devscripts \
    equivs \
    file \
    gcc \
    git \
    gnupg \
    libwww-perl \
    make \
    patch \
    patchutils \
    quilt \
    silversearcher-ag \
    tree \
    vim \
    xutils-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN printf '\nalias dquilt="quilt --quiltrc=${HOME}/.quiltrc-dpkg"\ncomplete -F _quilt_completion $_quilt_complete_opt dquilt\n' >> /root/.bashrc

RUN printf '\nd=. ; while [ ! -d $d/debian -a `readlink -e $d` != / ]; do d=$d/..; done\nif [ -d $d/debian ] && [ -z $QUILT_PATCHES ]; then\n\t# if in Debian packaging tree with unset $QUILT_PATCHES\n\tQUILT_PATCHES="debian/patches"\n\tQUILT_PATCH_OPTS="--reject-format=unified"\n\tQUILT_DIFF_ARGS="-p ab --no-timestamps --no-index --color=auto"\n\tQUILT_REFRESH_ARGS="-p ab --no-timestamps --no-index"\n\tQUILT_COLORS="diff_hdr=1;32:diff_add=1;34:diff_rem=1;31:diff_hunk=1;33:diff_ctx=35:diff_cctx=33"\n\tif ! [ -d $d/debian/patches ]; then mkdir $d/debian/patches; fi\nfi\n' >> /root/.quiltrc-dpkg

WORKDIR /root

ENTRYPOINT [ "bash" ]
