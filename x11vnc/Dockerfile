FROM alpine:latest
LABEL maintainer "luc@mazardo.com"

# docker build -t x11vnc .
# 
# docker run -it --rm \
# -v $HOME/.x11vncrc:/root/.x11vncrc:ro \
# -v /etc/machine-id:/etc/machine-id:ro \
# -v /tmp/.X11-unix:/tmp/.X11-unix \
# -e DISPLAY=$DISPLAY \
# --ipc host \
# -p 5900:5900 \
# x11vnc 

RUN apk --no-cache add \
	 x11vnc

ENTRYPOINT ["x11vnc"]
