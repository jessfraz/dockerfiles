# Usage:
#	docker run -d \
#		-v /etc/localtime:/etc/localtime:ro \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e "DISPLAY=unix${DISPLAY}" \
#		-v /usr/share/X11:/usr/share/X11:ro \
#		--net host \
#		--cap-add NET_ADMIN \
#		--name opensnitch \
#		r.j3ss.co/opensnitch
#
FROM r.j3ss.co/opensnitchd:latest

ENTRYPOINT ["/usr/local/bin/opensnitch-qt"]
