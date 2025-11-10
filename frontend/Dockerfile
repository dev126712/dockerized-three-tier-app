FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY package*.json .
RUN npm install --omit=dev
COPY . .
RUN npm run build


FROM node:20-alpine AS production



EXPOSE 8000
CMD [ "node", "start" ]
