FROM node:lts-bullseye

RUN mkdir /app

RUN dpkg --add-architecture i386 && \
    mkdir -pm755 /etc/apt/keyrings && \
    wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key && \
    wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/debian/dists/bullseye/winehq-bullseye.sources && \
    apt-get update && \
    apt install --install-recommends winehq-stable -y


COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN node --version && npm --version && npm install

COPY . /app

RUN npm run make:win