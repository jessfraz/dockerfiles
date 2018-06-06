FROM alpine:latest AS cl-k8s
RUN apk add --no-cache \
	git
RUN git clone https://github.com/brendandburns/cl-k8s.git /cl-k8s

FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	--repository https://dl-3.alpinelinux.org/alpine/edge/testing/ \
	ca-certificates \
	clisp

COPY .clisprc.lisp /home/user/.clisprc.lisp
COPY --from=cl-k8s /cl-k8s /home/user/quicklisp/local-projects/cl-k8s

# Install quicklisp
RUN wget -O /home/user/quicklisp.lisp https://beta.quicklisp.org/quicklisp.lisp

ENV HOME /home/user
RUN adduser -u 1001 -D user \
	&& chown -R user:user $HOME

USER user

WORKDIR $HOME

# Install quicklisp
RUN clisp -x '(load "quicklisp.lisp") (quicklisp-quickstart:install)'

ENTRYPOINT [ "clisp" ]
