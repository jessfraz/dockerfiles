# Usage:
#	docker run -d \
#		-v /etc/localtime:/etc/localtime:ro \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e "DISPLAY=unix${DISPLAY}" \
#		--net host \
#		--name opensnitch \
#		r.j3ss.co/opensnitch
#
FROM r.j3ss.co/opensnitchd:latest

ENTRYPOINT ["/usr/bin/opensnitch-qt"]
