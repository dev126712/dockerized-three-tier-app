FROM mongo:4.4
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD mongo --eval 'db.runCommand({ ping: 1 }).ok' --quiet

COPY init.js /docker-entrypoint-initdb.d/
USER mongodb
