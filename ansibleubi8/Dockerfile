FROM redhat/ubi8:latest

RUN yum check-update; \
    yum install -y gcc libffi-devel python3 epel-release; \
    yum install -y python3-pip; \
    yum install -y wget; \
    yum clean all

RUN pip3 install --upgrade pip
RUN pip3 install --upgrade virtualenv
RUN pip3 install pywinrm
RUN pip3 install requests
RUN pip3 install ansible

RUN mkdir /home/ansibleuser
RUN useradd -ms /bin/bash ansibleuser
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
