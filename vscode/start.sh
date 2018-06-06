#!/bin/bash
docker run -e DISPLAY=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'):0 -v $HOME:/home/user -v /tmp/.X11-unix:/tmp/.X11-unix code
