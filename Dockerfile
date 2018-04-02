FROM node:8.5.0

RUN echo "Asia/Shanghai" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN mkdir /app
WORKDIR /app

RUN npm install -g cnpm

COPY package.json /app
RUN cnpm install

