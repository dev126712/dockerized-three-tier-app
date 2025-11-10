FROM node:20-alpine AS test
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run test


FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=test /app/package.json ./
RUN npm install --omit=dev
COPY COPY --from=test /app .
EXPOSE 8000
CMD [ "node", "start" ]
