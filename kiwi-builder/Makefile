.PHONY: all build run clean

all: run

build:
	@docker build --rm --force-rm -t jess/kiwi-builder .

run: build
	$(shell docker run --rm -v $(CURDIR)/artifacts:/usr/src/artifacts jess/kiwi-builder mv suse-rootfs.tar artifacts)
	$(shell docker import artifacts/suse-rootfs.tar jess/opensuse:12.3)

clean:
	@rm -rf artifacts
