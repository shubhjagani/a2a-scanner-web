# A2A Scanner Web
A simple web interface for analyzing AI Agent security using the `cisco-ai-defense/a2a-scanner` library.

## Project Structure
- `/frontend`: React + Vite + Tailwind (Cybersec Dashboard)
- `/backend`: Python + FastAPI (Wrapper around a2a-scanner)

## Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Configuration
Set `OPENAI_API_KEY` in `backend/.env` to enable AI analysis.

