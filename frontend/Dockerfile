FROM node:20-alpine AS test
WORKDIR /app
COPY --chown=node:node ["package.json", "./"]
RUN npm install
COPY . .


FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=test --chown=node:node /app/package.json ./
RUN apk add --no-cache curl
RUN npm install --omit=dev
COPY --from=test --chown=node:node /app .
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8000/ || exit 1
EXPOSE 8000
CMD [ "node", "start" ]
