#!/bin/sh
set -e
cat > /usr/share/nginx/html/assets/env.js <<ENVJS
window.ENV = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_KEY: "${SUPABASE_KEY}"
};
ENVJS
echo "Variables de entorno inyectadas correctamente"
