FROM mongo:7.0
COPY init.js /docker-entrypoint-initdb.d/
RUN useradd -ms /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser
