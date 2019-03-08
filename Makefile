.PHONY: build
build: ## Builds all the dockerfiles in the repository.
	@$(CURDIR)/build-all.sh

.PHONY: latest-versions
latest-versions: ## Checks all the latest versions of the Dockerfile contents.
	@$(CURDIR)/latest-versions.sh

check_defined = \
				$(strip $(foreach 1,$1, \
				$(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
				  $(if $(value $1),, \
				  $(error Undefined $1$(if $2, ($2))$(if $(value @), \
				  required by target `$@')))

.PHONY: run
run: ## Run a Dockerfile from the command at the top of the file (ex. DIR=telnet).
	@:$(call check_defined, DIR, directory of the Dockefile)
	@$(CURDIR)/run.sh "$(DIR)"

REGISTRY := r.j3ss.co
.PHONY: image
image: ## Build a Dockerfile (ex. DIR=telnet).
	@:$(call check_defined, DIR, directory of the Dockefile)
	docker build --rm --force-rm -t $(REGISTRY)/$(subst /,:,$(patsubst %/,%,$(DIR))) ./$(DIR)

.PHONY: test
test: dockerfiles shellcheck ## Runs the tests on the repository.

.PHONY: dockerfiles
dockerfiles: ## Tests the changes to the Dockerfiles build.
	@$(CURDIR)/test.sh

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
