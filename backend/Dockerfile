FROM node:18-alpine 

WORKDIR /appp


COPY package*.json .

RUN npm install

RUN npm install mongodb

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
