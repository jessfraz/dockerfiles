# Run a git server in a container.
#
# docker run --rm -it -p 1234:22 \
# 	-e DEBUG=true \
# 	-e "PUBKEY=$(cat ~/.ssh/id_ed25519.pub)" \
# 	--name gitserver \
# 	jess/gitserver
FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV HOME /root

RUN apk --no-cache add \
	bash \
	git \
	openssh \
	&& sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/" /etc/ssh/sshd_config \
	&& sed -i "s/#PubkeyAuthentication yes/PubkeyAuthentication yes/" /etc/ssh/sshd_config \
	&& echo -e "AllowUsers git\n" >> /etc/ssh/sshd_config \
	&& echo -e "Port 22\n" >> /etc/ssh/sshd_config \
	&& addgroup git \
	&& adduser -D -S -s /usr/bin/git-shell -h /home/git -g git git \
	&& mkdir -p /home/git/.ssh \
	&& chown -R git:git /home/git \
	&& passwd -u git

ENV HOME /home/git
EXPOSE 22
WORKDIR $HOME

COPY ./start.sh /
COPY create_repo /usr/bin/create_repo

ENTRYPOINT ["/start.sh"]
CMD ["/usr/sbin/sshd", "-D", "-e", "-f", "/etc/ssh/sshd_config"]
