#!/bin/bash
set -e

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Set env vars first:"
  echo "  export CLOUDFLARE_API_TOKEN=..."
  echo "  export CLOUDFLARE_ACCOUNT_ID=..."
  echo "Or run: npx wrangler login"
  exit 1
fi

echo "=== Building ==="
npm run build

echo "=== Deploying to Cloudflare Pages ==="
npx wrangler pages deploy packages/@micro-measure-tool/app/dist --project-name micro-measure-tool
