---
title: DeepFake Detector API
emoji: 🔍
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# DeepFake Detector API

Flask backend powered by XceptionNet for deepfake detection.

- `GET /api/health` — health check
- `POST /api/detect` — upload image/video, returns REAL/FAKE verdict
