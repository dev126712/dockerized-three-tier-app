FROM mongo:7.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD mongosh --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)'

COPY init.js /docker-entrypoint-initdb.d/
USER mongodb