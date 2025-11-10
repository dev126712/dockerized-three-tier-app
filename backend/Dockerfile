FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8080

CMD [ "node", "dist/server.js" ]
