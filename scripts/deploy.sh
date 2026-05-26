#!/bin/bash
set -e

echo "=== Building ==="
npm run build

echo "=== Deploying to Cloudflare Pages ==="
npx wrangler pages deploy packages/@micro-measure-tool/app/dist --project-name micro-measure-tool
