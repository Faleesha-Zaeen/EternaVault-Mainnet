#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "[setup] Installing frontend deps if missing..."
if [ ! -d "frontend/node_modules" ]; then
  cd frontend
  npm install
  cd ..
fi

echo "[setup] Installing backend deps if missing..."
if [ ! -d "backend/node_modules" ]; then
  cd backend
  npm install
  cd ..
fi

echo "[setup] Installing contracts deps if missing..."
if [ ! -d "contracts/node_modules" ]; then
  cd contracts
  npm install
  cd ..
fi

echo "[setup] Compiling contracts..."
cd contracts
npx hardhat compile || echo "Hardhat compile failed (check env), continuing..."
cd ..

echo "[setup] Building frontend..."
cd frontend
npm run build || echo "Frontend build failed, you can run again after fixing issues."
cd ..

echo "[setup] Done. To run dev servers: npm run dev"