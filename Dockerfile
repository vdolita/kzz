FROM node:lts-bullseye

RUN mkdir /app

RUN wget -nc -O /usr/share/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key \
    wget -nc -P /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/debian/dists/bullseye/winehq-bullseye.sources \
    apt-get update \
    apt install --install-recommends winehq-devel


COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN node --version && npm --version && npm install

COPY . /app

# RUN npm run make:win