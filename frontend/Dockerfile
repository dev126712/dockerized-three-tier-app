FROM node:20-alpine AS test
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .


FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=test /app/package.json ./
RUN npm install --omit=dev
COPY --from=test /app .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD [ "node", "start" ]
