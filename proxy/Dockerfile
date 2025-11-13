FROM nginx:latest
RUN apk update && apk add curl --no-cache
RUN apk add --no-cache curl
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup
RUN chown -R nginxuser:nginxgroup /var/cache/nginx /var/run /var/log/nginx
USER nginxuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost/ || exit 1
RUN apk add gettext --no-cache
ENTRYPOINT ["/bin/bash", "-c", "envsubst < /tmp/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
