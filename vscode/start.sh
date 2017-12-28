#!/bin/bash
docker run  -v $HOME:/home/user -e DISPLAY=10.0.0.236:0  -v /tmp/.X11-unix:/tmp/.X11-unix code
