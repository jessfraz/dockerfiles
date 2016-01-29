#!/bin/bash
set -e

# get the dockerfiles
IFS=$'\n'
files=( $(find . -iname '*Dockerfile' | sed 's|./||') )
unset IFS

# build the changed dockerfiles
for f in "${files[@]}"; do
	image=${f%Dockerfile}
	base=${image%%\/*}
	suite=${image##*\/}
	build_dir=$(dirname $f)

	if [[ -z "$suite" ]]; then
		suite=latest
	fi

	(
	set -x
	docker build --rm --force-rm -t r.j3ss.co/${base}:${suite} ${build_dir}
	)

	echo "                       ---                                   "
	echo "Successfully built ${base}:${suite} with context ${build_dir}"
	echo "                       ---                                   "

	docker push --disable-content-trust=false r.j3ss.co/${base}:${suite}
done
