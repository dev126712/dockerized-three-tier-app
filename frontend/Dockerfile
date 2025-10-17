FROM node:18-alpine

WORKDIR /appp

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD [ "npm", "start" ]
