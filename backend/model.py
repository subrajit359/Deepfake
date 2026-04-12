import os
import numpy as np
import cv2

# Flag for demo mode (when no trained model exists)
DEMO_MODE = False
model = None

CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

IMG_SIZE = 299


def load_model():
    """
    Load the trained XceptionNet model from disk.
    Falls back to demo mode if model file is not found.
    """
    global model, DEMO_MODE

    model_path = os.path.join(os.path.dirname(__file__), "deepfake_detector.h5")

    if not os.path.exists(model_path):
        print("[WARNING] Model file 'deepfake_detector.h5' not found.")
        print("[INFO] Running in DEMO MODE — results are simulated.")
        print("[INFO] Train the model using model_training/train_model.ipynb")
        print("[INFO] Place the saved deepfake_detector.h5 in backend/")
        DEMO_MODE = True
        return

    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(model_path)
        print(f"[INFO] XceptionNet model loaded from {model_path}")
        DEMO_MODE = False
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        print("[INFO] Falling back to DEMO MODE")
        DEMO_MODE = True


def detect_and_crop_face(img_array):
    """
    Detect the primary face in the image using OpenCV Haar cascade.
    Returns the cropped and resized face region, or the full image if no face found.
    """
    gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    if len(faces) == 0:
        # No face detected — use the full image
        resized = cv2.resize(img_array, (IMG_SIZE, IMG_SIZE))
        return resized, False

    # Use the largest detected face
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces[0]

    # Add padding around the face (20%)
    padding = int(min(w, h) * 0.2)
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(img_array.shape[1], x + w + padding)
    y2 = min(img_array.shape[0], y + h + padding)

    face_crop = img_array[y1:y2, x1:x2]
    resized = cv2.resize(face_crop, (IMG_SIZE, IMG_SIZE))
    return resized, True


def preprocess_image(file_bytes):
    """
    Preprocess image bytes for XceptionNet inference:
    1. Decode image
    2. Detect and crop face with Haar cascade
    3. Resize to 299x299
    4. Normalize pixel values to [0, 1]
    Returns (preprocessed_array, face_detected)
    """
    # Decode bytes to numpy array
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image. Ensure the file is a valid JPEG, PNG, or BMP.")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    face_img, face_detected = detect_and_crop_face(img)
    face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)

    # Normalize to [0, 1]
    normalized = face_rgb.astype(np.float32) / 255.0

    # Add batch dimension → (1, 299, 299, 3)
    batch = np.expand_dims(normalized, axis=0)

    return batch, face_detected


def extract_video_frame(file_bytes, frame_index=0):
    """
    Extract a representative frame from a video file for analysis.
    Tries to get a frame from the middle of the video.
    """
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Seek to middle frame for better face detection
        target_frame = max(0, total_frames // 2)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)

        ret, frame = cap.read()
        cap.release()

        if not ret or frame is None:
            raise ValueError("Could not extract frame from video.")

        # Encode frame to JPEG bytes for reuse
        _, buffer = cv2.imencode(".jpg", frame)
        return buffer.tobytes()
    finally:
        os.unlink(tmp_path)


def _demo_predict(face_detected):
    """
    Demo mode: generate a realistic-looking result without a real model.
    Returns fake/real with randomized confidence to simulate real behavior.
    """
    import random
    import hashlib
    import time

    seed = int(time.time() * 1000) % 10000
    random.seed(seed)

    # Slightly bias toward FAKE for demo interest
    is_fake = random.random() < 0.6
    base_confidence = random.uniform(72.0, 98.5)

    return is_fake, round(base_confidence, 1)


def predict(file_bytes, mime_type="image/jpeg"):
    """
    Run inference on the given image or video file bytes.

    Args:
        file_bytes: Raw bytes of the uploaded file
        mime_type:  MIME type of the file (image/jpeg, image/png, video/mp4)

    Returns:
        dict: {
            "result": "FAKE" | "REAL",
            "confidence": float (0-100),
            "label": str,
            "face_detected": bool,
            "mode": "model" | "demo"
        }
    """
    is_video = mime_type.startswith("video/")

    # Extract frame if video
    if is_video:
        try:
            file_bytes = extract_video_frame(file_bytes)
        except Exception as e:
            raise ValueError(f"Video processing error: {e}")

    # Preprocess
    preprocessed, face_detected = preprocess_image(file_bytes)

    # Demo mode
    if DEMO_MODE:
        is_fake, confidence = _demo_predict(face_detected)
        result = "FAKE" if is_fake else "REAL"
        label = "DeepFake Detected" if is_fake else "Authentic Media"

        return {
            "result": result,
            "confidence": confidence,
            "label": label,
            "face_detected": face_detected,
            "mode": "demo",
            "warning": "No trained model found. Results are simulated. Train using model_training/train_model.ipynb"
        }

    # Real model inference
    raw_score = float(model.predict(preprocessed, verbose=0)[0][0])

    # Score ≥ 0.5 → FAKE
    is_fake = raw_score >= 0.5
    confidence = raw_score * 100 if is_fake else (1 - raw_score) * 100
    confidence = round(confidence, 1)

    result = "FAKE" if is_fake else "REAL"
    label = "DeepFake Detected" if is_fake else "Authentic Media"

    return {
        "result": result,
        "confidence": confidence,
        "label": label,
        "face_detected": face_detected,
        "mode": "model"
    }
