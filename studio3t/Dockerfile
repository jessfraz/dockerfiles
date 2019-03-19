# RUN studio3t TRIAL LICENSE infinitely
#
# 1. Download(Recommended!) or curl(Default), and extract the file, jump to '"""' to change.
# studio3t(https://download.studio3t.com/studio-3t/linux/2019.1.0/studio-3t-linux-x64.tar.gz)
# Version: 2019.1.0
# $ tar -jxvf studio-3t-linux-x64.tar.gz
#
# 2. Create image.
# $ docker build . -t studio3t
#
# 3. Install dependence.
# (Mac required)
# $ brew install socat
# $ brew cask install xquartz
# (Ubuntu required)
# $ sudo apt install -y x11-xserver-utils
# $ xhost +
#
# 4. Run docker for the first time.
# (Mac)
# NOTE:
# Open a new Terminal to run docker after run socat!!!
# It will encounter an startup error when first run, then close it and docker start it again, all will be ok!
# $ socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
# $ docker run -d \
#       --name s3t \
#       --net host \
#       -v /tmp/.X11-unix:/tmp/.X11-unix \
#       -e DISPLAY=docker.for.mac.host.internal:0 \
#       studio3t
#
# (Ubuntu)
# $ docker run -d \
#       --name s3t \
#       --net host \
#       -v /tmp/.X11-unix:/tmp/.X11-unix \
#       -e DISPLAY=unix$DISPLAY \
#       studio3t
#
# 5. Run studio3t successfully.
# $ docker start s3t
#
# Q & A:
# 1. Is Chinese characters displaying ok?
#    -   No, but it's normal when the content is copied to my mac.
#
FROM ubuntu:18.04
LABEL maintainer "Nick <atlednolispe@gmail.com>"

## Attempt to suppport chinese, but failed.
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

## Speed up apt by aliyun, should be replace by the nearest source for you or just comment.
# RUN echo "deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse\ndeb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse\n\ndeb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse\ndeb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse\n\ndeb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse\ndeb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse\n\ndeb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse\ndeb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse\n\ndeb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse\ndeb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse\n" > /etc/apt/sources.list

## Useradd could be redundant.
RUN apt-get update \
        && apt-get install -y sudo \
        && useradd -m docker \
        && echo "docker:docker" | chpasswd \
        && adduser docker sudo

## Dependence to open studio3t.
RUN apt-get install -y openjdk-8-jdk \
        && apt-get install -y libssl1.0.0 libssl-dev \
        && apt-get install -y curl

USER docker

## """
## either-or to get studio3t
## 1. localhost download
# COPY ./studio-3t-linux-x64.sh /home/docker/Downloads/
## 2. curl download, maybe too slow
RUN mkdir -p /home/docker/Downloads \
        && curl -o /home/docker/Downloads/studio-3t-linux-x64.tar.gz \
               "https://download.studio3t.com/studio-3t/linux/2019.1.0/studio-3t-linux-x64.tar.gz" \
        && tar -zxvf /home/docker/Downloads/studio-3t-linux-x64.tar.gz -C /home/docker/Downloads

WORKDIR /home/docker

## Automatic installation.
RUN sh -c \
        '/bin/echo -e \
             "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n1\n/home/docker/Applications/studio3t\nn\nn\n" \
             | bash Downloads/studio-3t-linux-x64.sh'

## Autorun.
ENTRYPOINT ["/home/docker/Applications/studio3t/Studio-3T"]
