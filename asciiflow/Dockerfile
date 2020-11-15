# 20201115.1503.NT: This only bakes in the building environment into an image,
# the intended usage is something like:
# 1. Build the image with
# 	$ docker build . -t asciiflow
# 2. Clone asciiflow2 into a local folder, say $HOME/repos/asciiflow2
# 3. Use the image per p.1 to buld asciiflow
# 	$ docker run -it --rm -v $HOME/repos/asciiflow2:/opt/app asciiflow:latest /opt/app/compile.sh
# 4. Open $HOME/repos/asciiflow2/index.html in a browser on the host.
#
FROM store/oracle/serverjre:1.8.0_241-b07

RUN yum install -y \
 	git

RUN git clone --depth 1 https://github.com/tsanov/asciiflow2.git /opt/app

# install dependencies
WORKDIR /opt/app
RUN ./compile.sh

CMD ["bash"]
