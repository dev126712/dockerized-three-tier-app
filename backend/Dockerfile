FROM node:20-alpine AS test
WORKDIR /app
ENV DATABASE_URI="mongodb://localhost:27017/test_db_for_docker_tests"
COPY package*.json .
RUN npm install
COPY . .
RUN npm run test

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=test /app/package.json ./
RUN npm install --omit=dev
COPY --from=test /app .
EXPOSE 8080

CMD [ "node", "backend/server.js" ]
