#!/bin/bash
echo "🚀 Launching A2A Scanner..."

# Start Backend in background
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo "🌟 Services Started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
