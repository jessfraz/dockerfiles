FROM nginx

RUN apt-get update && apt-get install -y zip curl
RUN curl -o /usr/share/nginx/html/master.zip -L https://codeload.github.com/gabrielecirulli/2048/zip/master && cd /usr/share/nginx/html/ && unzip master.zip && mv 2048-master/* .