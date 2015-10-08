FROM python:2.7
MAINTAINER Jessica Frazelle <jess@docker.com>

# install linear algebra dependencies
RUN apt-get update && apt-get install -y \
	gfortran \
	libopenblas-dev \
	liblapack-dev \
	libzmq-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install -U \
	numpy \
	scipy \
	matplotlib \
	pandas \
	patsy \
	statsmodels \
	scikit-learn \
	ggplot \
	pyzmq \
	jinja2 \
	tornado \
	ipython

EXPOSE 8888

ADD notebook.sh /
RUN chmod u+x /notebook.sh \
	&& mkdir -p /root/notebooks

WORKDIR /root/notebooks

CMD ["/notebook.sh"]
