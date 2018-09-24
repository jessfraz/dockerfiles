.PHONY: build
build: ## Builds all the dockerfiles in the repository.
	./build-all.sh

.PHONY: latest-versions
latest-versions: ## Checks all the latest versions of the Dockerfile contents.
	./latest-versions.sh

.PHONY: test
test: shellcheck dockerfiles ## Runs the tests on the repository.

.PHONY: dockerfiles
dockerfiles: ## Tests the changes to the Dockefiles build.
	./test.sh

# if this session isn't interactive, then we don't want to allocate a
# TTY, which would fail, but if it is interactive, we do want to attach
# so that the user can send e.g. ^C through.
INTERACTIVE := $(shell [ -t 0 ] && echo 1 || echo 0)
ifeq ($(INTERACTIVE), 1)
        DOCKER_FLAGS += -t
endif

.PHONY: shellcheck
shellcheck: ## Runs the shellcheck tests on the scripts.
	docker run --rm -i $(DOCKER_FLAGS) \
		--name df-shellcheck \
		-v $(CURDIR):/usr/src:ro \
		--workdir /usr/src \
		r.j3ss.co/shellcheck ./shellcheck.sh

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
