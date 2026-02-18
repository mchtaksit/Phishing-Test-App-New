#!/bin/bash
set -e

# Default değerler
BACKEND_URL=${BACKEND_URL:-"10.0.0.2:8080"}

# BACKEND_URL'den http:// veya https:// prefix'ini kaldır (upstream için)
BACKEND_URL_CLEAN=$(echo "$BACKEND_URL" | sed 's|https\?://||')

# Nginx config template'ini işle
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# BACKEND_URL'i upstream için güncelle (protocol olmadan)
sed -i "s|\${BACKEND_URL}|${BACKEND_URL_CLEAN}|g" /etc/nginx/conf.d/default.conf

echo "========================================"
echo "Phishing Simulation - Frontend"
echo "========================================"
echo "Backend URL: ${BACKEND_URL}"
echo "========================================"

# Nginx'i başlat
exec "$@"
