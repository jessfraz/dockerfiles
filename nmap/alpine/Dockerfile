FROM alpine:latest

RUN apk --no-cache upgrade \ 
    && apk add --no-cache \
	nmap \
    nmap-scripts

ENTRYPOINT ["nmap"]

