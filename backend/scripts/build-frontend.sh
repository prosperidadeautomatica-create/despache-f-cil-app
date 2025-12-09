#!/bin/bash
# Script to build frontend and copy to backend/frontend directory

echo "Building frontend..."
cd ../frontend
npm run build

echo "Copying built files to backend/frontend..."
rm -rf ../backend/frontend/*
cp -r dist/* ../backend/frontend/

echo "✓ Frontend built and copied to backend/frontend"
echo "You can now run: cd ../backend && npm start"

