#!/bin/bash
echo "🚧 Setting up A2A Scanner Environment..."

# Backend Setup
echo "🐍 Installing Backend Deps..."
cd backend
pip install -r requirements.txt
cd ..

# Frontend Setup
echo "⚛️ Installing Frontend Deps..."
cd frontend
npm install
cd ..

echo "✅ Setup Complete. Run './start.sh' to launch."
