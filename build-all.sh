#!/bin/bash
set -e

build_and_push(){
	base=$1
	suite=$2
	build_dir=$3

	(
	set -x
	docker build --rm --force-rm -t r.j3ss.co/${base}:${suite} ${build_dir} || exit 1
	)

	echo "                       ---                                   "
	echo "Successfully built ${base}:${suite} with context ${build_dir}"
	echo "                       ---                                   "

	# try push a few times because notary server sometimes returns 401 for
	# absolutely no reason
	n=0
	until [ $n -ge 5 ]; do
		docker push --disable-content-trust=false r.j3ss.co/${base}:${suite} && break
		echo "Try #$n failed... sleeping for 15 seconds"
		n=$[$n+1]
		sleep 15
	done

	# also push the tag latest for "stable" tags
	if [[ "$suite" == "stable" ]]; then
		docker tag r.j3ss.co/${base}:${suite} r.j3ss.co/${base}:latest
		docker push --disable-content-trust=false r.j3ss.co/${base}:latest
	fi

}

main(){
	# get the dockerfiles
	IFS=$'\n'
	files=( $(find . -iname '*Dockerfile' | sed 's|./||') )
	unset IFS

	ERRORS=()
	# build all dockerfiles
	for f in "${files[@]}"; do
		image=${f%Dockerfile}
		base=${image%%\/*}
		build_dir=$(dirname $f)
		suite=${build_dir##*\/}

		if [[ -z "$suite" ]] || [[ "$suite" == "$base" ]]; then
			suite=latest
		fi

		if [[ "${base}" == "sup" ]]; then
			continue
		fi

		{
			build_and_push "${base}" "${suite}" "${build_dir}"
		} || {
			# add to errors
			ERRORS+=("${base}:${suite}")
		}
		echo
		echo
	done

	if [ ${#ERRORS[@]} -eq 0 ]; then
    	echo "No errors, hooray"
	else
    	echo "These images failed: ${ERRORS[@]}"
		exit 1
	fi
}

main $@
