FROM mongo:7.0
COPY init.js /docker-entrypoint-initdb.d/
RUN adduser -D alexandre
USER alexandre
USER appuser
