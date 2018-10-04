FROM r.j3ss.co/reg as reg
FROM jess/gcloud

RUN	apk add --no-cache \
	ca-certificates \
	bash \
	jq \
	parallel

WORKDIR /root

COPY clean-registry /usr/bin/clean-registry
COPY --from=reg /usr/bin/reg /usr/bin/reg

ENTRYPOINT ["clean-registry"]
