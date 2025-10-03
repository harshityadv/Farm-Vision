FARM-VISION

Mobile‑first crop disease detection with a Next.js frontend and a FastAPI backend powered by a fastai model and disease_info.json metadata.

Overview
Capture or upload a leaf image, send to /predict, and view disease name, cause, prevention, treatment, and confidence on a responsive UI optimized for Android browsers.

Auth supports Google sign‑in and guest mode; history is stored per user in Firestore for signed‑in sessions only.

Monorepo layout
text
api/        # FastAPI server, model loader, disease_info.json
web/        # Next.js app with Tailwind + Firebase auth
public/     # static assets (e.g., favicon)
research/   # training/eval notebooks
This mirrors the current code files and keeps API, web, and research concerns separate for clean deployment and iteration.

Quick start
Backend

cd api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt.

Place the trained .pkl under api/models/ and ensure MODEL_PATH in main.py matches the filename.

uvicorn main:app --reload --port 8000 to start the predictor at /predict with JSON enrichment from disease_info.json.

Frontend

cd web && cp .env.local.example .env.local and set NEXT_PUBLIC_API_ENDPOINT to your FastAPI URL and Firebase keys if externalized.

npm install && npm run dev to start the mobile‑optimized app on http://localhost:3000.

Environment
Frontend env (recommended): NEXT_PUBLIC_API_ENDPOINT and NEXT_PUBLIC_FIREBASE_* to match the Firebase project and API host used by page.js.

Backend has no required env by default; update MODEL_PATH or ports directly in main.py or via process manager configs for deployment.

Notes
disease_info.json maps predicted classes to human‑readable disease fields shown in the Result screen; keep keys consistent with model output when retraining.

research/ contains the training notebook to reproduce the model and verify metrics before exporting a new learner.
