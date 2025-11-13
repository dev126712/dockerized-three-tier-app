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
RUN apk add --no-cache curl
RUN npm install --omit=dev
COPY --from=test /app .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appuser /app
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8080/ || exit 1
EXPOSE 8080

CMD [ "node", "backend/server.js" ]
