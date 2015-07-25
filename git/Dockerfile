# VERSION: 0.1
# DESCRIPTION: Set up a git server with SSH access and create a bare git repository
# AUTHOR: Kaustubh Kelkar <kkelkar@hawk.iit.edu>
#
# COMMENTS: start.sh will generate a keypair that can access the container
#	    and starts the Docker build.
#	    config.sh sets up bare git repository. It can be modified to
#	    initialize multiple repositories and print the remote URLs for 
#	    the same.
#	    SSH server can be configured as required. See
#	    https://help.ubuntu.com/community/SSH/OpenSSH/Configuring for details.
#
# USAGE: # Download the Dockerfile
#	 wget -r http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/git/
#
#	 # Build git server image
#	 ./start.sh
# 	
#	 # Run the container
#	 docker run -d --name=myserver kkelkar/gitserver
#	 ip=`docker inspect --format {{.NetworkSettings.IPAddress}} myserver`
#	 ssh -i git-key git@$ip
#
#	 # To switch to root, use
#	 su -

FROM ubuntu:trusty

MAINTAINER Kaustubh Kelkar <kkelkar@hawk.iit.edu>

RUN apt-get update
RUN apt-get install -y git
RUN adduser git --disabled-password \
    --gecos "Full name, Room Number, Work Phone, Home Phone, Other"
RUN apt-get install -y openssh-server

#Configure SSH stuff
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN echo "AllowUsers git" >> /etc/ssh/sshd_config
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

USER git
RUN mkdir -p /home/git/.ssh
COPY git-key.pub /home/git/.ssh/authorized_keys

USER root
RUN echo "root:admin" | chpasswd

#Setup git repository
COPY config.sh /home/git/config.sh
RUN /home/git/config.sh
RUN rm -f /home/git/config.sh

ENTRYPOINT ["service", "ssh", "start", "-D"]
