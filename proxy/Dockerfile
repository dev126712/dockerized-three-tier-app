FROM nginx:latest
RUN adduser -D alexandre
USER alexandre
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost/ || exit 1

ENTRYPOINT ["/bin/bash", "-c", "envsubst < /tmp/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]