#!/bin/bash
# Direct Netlify deployment script

echo "🚀 Deploying to Netlify..."
echo "📦 Build directory: dist/"
echo "🔧 Site: anaiahmednagehnoufal"

# Use npx to deploy without global install
npx netlify-cli deploy \
  --prod \
  --dir=dist \
  --site=anaiahmednagehnoufal \
  --message="Production deployment with all Activity fixes - $(date +%Y%m%d-%H%M%S)"
