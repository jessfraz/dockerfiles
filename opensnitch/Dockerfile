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

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& mkdir -p $HOME/.cache/dconf \
	&& mkdir -p $HOME/.dbus \
	&& chown -R user:user $HOME

WORKDIR $HOME

USER user

ENTRYPOINT ["/usr/local/bin/opensnitch-qt", "--debug"]
