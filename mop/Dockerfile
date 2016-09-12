# Run mop-tracker in a container
#
# docker run -it --rm \
#       -v ~/.moprc:/root/.moprc \
#       --name mop
#       freebirdljj/mop
FROM golang:latest
MAINTAINER FreeBirdLjj

RUN go get github.com/mop-tracker/mop && go install -x github.com/mop-tracker/mop/cmd/mop && rm -fr $GOPATH/src/github.com

ENTRYPOINT ["mop"]
