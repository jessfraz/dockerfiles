.PHONY: build
build: ## Builds all the dockerfiles in the repository.
	./build-all.sh

.PHONY: latest-versions
latest-versions: ## Checks all the latest versions of the Dockerfile contents.
	./latest-versions.sh

.PHONY: test
test: ## Runs the tests on the repository.
	./test.sh

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
