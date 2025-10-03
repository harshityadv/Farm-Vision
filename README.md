# 🌱 FARM-VISION

**Mobile-first crop disease detection** with a **Next.js frontend** and a **FastAPI backend** powered by a **fastai model** and `disease_info.json` metadata.

---

## 🚀 Overview

* Capture or upload a **leaf image**
* Send to `/predict` endpoint
* View **disease name, cause, prevention, treatment, and confidence**
* **Responsive UI** optimized for Android browsers

**Authentication:**

* 🔑 Google Sign-in
* 👤 Guest mode

**History:**

* Stored per user in **Firestore** for signed-in sessions only

---

## 📂 Monorepo Layout

```
api/       # FastAPI server, model loader, disease_info.json
web/       # Next.js app with Tailwind + Firebase auth
public/    # Static assets (e.g., favicon)
```

This structure keeps **API and web** concerns separate for clean deployment and iteration.

---

## ⚡ Quick Start

### Backend

```bash
cd api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

* Place the trained `.pkl` under `api/models/`
* Ensure `MODEL_PATH` in `main.py` matches the filename

Run the server:

```bash
uvicorn main:app --reload --port 8000
```

Predictor available at:

```
/predict (with JSON enrichment from disease_info.json)
```

---

### Frontend

```bash
cd web
cp .env.local.example .env.local
```

Set in `.env.local`:

```
NEXT_PUBLIC_API_ENDPOINT=<your-fastapi-url>
NEXT_PUBLIC_FIREBASE_*
```

Then start:

```bash
npm install
npm run dev
```

Runs at:

```
http://localhost:3000
```

---

## ⚙️ Environment Variables

### Frontend

* `NEXT_PUBLIC_API_ENDPOINT` → FastAPI URL
* `NEXT_PUBLIC_FIREBASE_*` → Firebase project keys

### Backend

* No required env by default
* Configure `MODEL_PATH` or ports directly in `main.py` or process manager configs

---

## 📘 Notes

* `disease_info.json` maps **predicted classes** to **human-readable disease fields** shown in the Result screen.
* Keep keys **consistent with model output** when retraining.
* `api/` contains the **training notebook** to reproduce the model and verify metrics before exporting a new learner.

---

## 🧪 Research

* Training notebooks located in `api/`
* Evaluate metrics before exporting a new `.pkl` model for deployment



