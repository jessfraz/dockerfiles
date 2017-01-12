#!/bin/bash
set -e
set -o pipefail

REPO_URL="${REPO_URL:-r.j3ss.co}"
JOBS=${JOBS:-2}
export REPO_URL

build_and_push(){
	base=$1
	suite=$2
	build_dir=$3

	echo "Building ${REPO_URL}/${base}:${suite} for context ${build_dir}"
	docker build --rm --force-rm -t ${REPO_URL}/${base}:${suite} ${build_dir} || return 1

	# on successful build, push the image
	echo "                       ---                                   "
	echo "Successfully built ${base}:${suite} with context ${build_dir}"
	echo "                       ---                                   "

	# try push a few times because notary server sometimes returns 401 for
	# absolutely no reason
	n=0
	until [ $n -ge 5 ]; do
		docker push --disable-content-trust=false ${REPO_URL}/${base}:${suite} && break
		echo "Try #$n failed... sleeping for 15 seconds"
		n=$[$n+1]
		sleep 15
	done

	# also push the tag latest for "stable" tags
	if [[ "$suite" == "stable" ]]; then
		docker tag ${REPO_URL}/${base}:${suite} ${REPO_URL}/${base}:latest
		docker push --disable-content-trust=false ${REPO_URL}/${base}:latest
	fi
}
export -f build_and_push

dofile() {
	f=$1
	image=${f%Dockerfile}
	base=${image%%\/*}
	build_dir=$(dirname $f)
	suite=${build_dir##*\/}

	if [[ -z "$suite" ]] || [[ "$suite" == "$base" ]]; then
		suite=latest
	fi

	{
		build_and_push "${base}" "${suite}" "${build_dir}"
	} || {
	# add to errors
	export ERRORS="${ERRORS} ${base}:${suite} "
}
echo
echo
}
export -f dofile

main(){
	# get the dockerfiles
	IFS=$'\n'
	files=( $(find . -iname '*Dockerfile' | sed 's|./||' | sort) )
	unset IFS

	export ERRORS=""
	# build all dockerfiles
	echo "Running in parallel with ${JOBS} jobs."
	parallel -j"${JOBS}" dofile "{1}" ::: "${files[@]}"

	if [[ "$ERRORS" == "" ]]; then
		echo "No errors, hooray!"
	else
		echo "[ERROR] Some images did not build correctly, see below." >&2
		echo "These images failed: ${ERRORS[@]}" >&2
		exit 1
	fi
}

main $@
