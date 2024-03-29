FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN mkdir -p ./images

COPY . .

EXPOSE 82

CMD [ "node", "server.js" ]
