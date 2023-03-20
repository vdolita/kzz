FROM electronuserland/builder:wine-mono

RUN mkdir /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN node --version && npm --version && npm install