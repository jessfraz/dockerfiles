#!/bin/bash
set -e
set -o pipefail

# this is kind of an expensive check, so let's not do this twice if we
# are running more than one validate bundlescript
VALIDATE_REPO='https://github.com/jessfraz/dockerfiles.git'
VALIDATE_BRANCH='master'

VALIDATE_HEAD="$(git rev-parse --verify HEAD)"

git fetch -q "$VALIDATE_REPO" "refs/heads/$VALIDATE_BRANCH"
VALIDATE_UPSTREAM="$(git rev-parse --verify FETCH_HEAD)"

VALIDATE_COMMIT_DIFF="$VALIDATE_UPSTREAM...$VALIDATE_HEAD"

validate_diff() {
	if [ "$VALIDATE_UPSTREAM" != "$VALIDATE_HEAD" ]; then
		git diff "$VALIDATE_COMMIT_DIFF" "$@"
	else
		git diff HEAD~ "$@"
	fi
}

# get the dockerfiles changed
IFS=$'\n'
# shellcheck disable=SC2207
files=( $(validate_diff --name-only -- '*Dockerfile') )
unset IFS

# build the changed dockerfiles
# shellcheck disable=SC2068
for f in ${files[@]}; do
	if ! [[ -e "$f" ]]; then
		continue
	fi

	build_dir=$(dirname "$f")
	base="${build_dir%%\/*}"
	suite="${build_dir##$base}"
	suite="${suite##\/}"

	if [[ -z "$suite" ]]; then
		suite=latest
	fi

	(
	set -x
	docker build -t "${base}:${suite}" "${build_dir}"
	)

	echo "                       ---                                   "
	echo "Successfully built ${base}:${suite} with context ${build_dir}"
	echo "                       ---                                   "
done
