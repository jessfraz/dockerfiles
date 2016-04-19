.PHONY: build_rootfs_image rootfs clean

BASE := http://stable.release.core-os.net/amd64-usr/current

COREOS_IMAGE := coreos_production_image.bin.bz2
DECOMPRESSED_COREOS_IMAGE := $(COREOS_IMAGE:.bz2=)

VERSION_FILE := version.txt

DOCKER_BUILD_ROOTFS_IMAGE := coreos:build

all: rootfs

$(COREOS_IMAGE):
	@gpget -O -b -url "$(BASE)/$(COREOS_IMAGE)"

$(DECOMPRESSED_COREOS_IMAGE): $(COREOS_IMAGE)
	@bzip2 -d "$(COREOS_IMAGE)"

$(VERSION_FILE):
	@gpget -O -b -url "$(BASE)/$(VERSION_FILE)"

build_rootfs_image: $(VERSION_FILE)
	@docker build --rm --force-rm -f Dockerfile.build -t $(DOCKER_BUILD_ROOTFS_IMAGE) .

rootfs: build_rootfs_image
	@sudo modprobe fuse
	@docker run --rm -it --privileged -v $(CURDIR):/images $(DOCKER_BUILD_ROOTFS_IMAGE) bash

clean:
	$(RM) $(COREOS_IMAGE) $(DECOMPRESSED_COREOS_IMAGE) $(VERSION_FILE)
