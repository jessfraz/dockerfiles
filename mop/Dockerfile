# Run mop-tracker in a container
#
# docker run -it --rm \
# 	-v ~/.moprc:/root/.moprc \
# 	--name mop \
# 	r.j3ss.co/mop
#
FROM alpine:latest as builder

RUN apk --no-cache add \
	ca-certificates

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN buildDeps=' \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& go get github.com/mop-tracker/mop/cmd/mop \
	&& echo "Build complete."

FROM alpine:latest
COPY --from=builder /go/bin/mop /usr/bin/mop
ENTRYPOINT [ "mop" ]
