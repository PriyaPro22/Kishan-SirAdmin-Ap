#!/bin/bash

# Configuration
TUNNEL_NAME="test-bijliwala"
DOMAIN="test.bijliwalaaya.in"
# Update path if necessary
CREDENTIALS_FILE="$HOME/.cloudflared"

# Ensure cloudflared is logged in
if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
    echo "❌ Cloudflare login not found!"
    echo "Please open the URL in your browser to login:"
    cloudflared tunnel login | grep -o 'https://.*' | head -1
    exit 1
fi

echo "✅ Cloudflare login found!"

# Check/Create Tunnel
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
    echo "Creating new tunnel: $TUNNEL_NAME..."
    RESULT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$RESULT" | grep "Created tunnel" | awk '{print $NF}' | tr -d '"')
    echo "Created Tunnel ID: $TUNNEL_ID"
else
    echo "Found existing Tunnel ID: $TUNNEL_ID"
fi

# Create Config File
mkdir -p "$HOME/.cloudflared"
cat > "$HOME/.cloudflared/config.yml" <<EOL
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:4001
  - service: http_status:404
EOL

echo "✅ Config file created at ~/.cloudflared/config.yml"

# Route DNS (CNAME)
echo "Routing DNS for $DOMAIN..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

# Run Tunnel
echo "Starting tunnel for $DOMAIN -> http://localhost:4001..."
cloudflared tunnel run "$TUNNEL_NAME"
