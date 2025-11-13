FROM nginx:latest
RUN apt update \
    && apt install -y curl gettext \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -ms /bin/bash nginxuser \
    && chown -R nginxuser:nginxuser /var/cache/nginx /var/run /var/log/nginx
USER nginxuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost/ || exit 1
ENTRYPOINT ["/bin/bash", "-c", "envsubst < /tmp/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
