FROM python:2.7.8
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN pip install -U numpy

# install linear algebra dependencies
RUN apt-get update && apt-get install -y \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libzmq-dev \
    --no-install-recommends
RUN pip install -U scipy

RUN pip install -U matplotlib
RUN pip install -U pandas
RUN pip install -U patsy
RUN pip install -U statsmodels
RUN pip install -U scikit-learn
RUN pip install -U ggplot
RUN pip install -U pyzmq
RUN pip install -U jinja2
RUN pip install -U tornado
RUN pip install -U ipython

EXPOSE 8888

ADD notebook.sh /
RUN chmod u+x /notebook.sh && mkdir -p /root/notebooks

WORKDIR /root/notebooks

CMD ["/notebook.sh"]
