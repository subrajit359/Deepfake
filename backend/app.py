import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import model as detector

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "mp4", "mov", "avi"}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_mime_type(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    video_exts = {"mp4", "mov", "avi"}
    return "video/mp4" if ext in video_exts else f"image/{ext}"


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "running",
        "model_mode": "demo" if detector.DEMO_MODE else "model",
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route("/api/detect", methods=["POST"])
def detect():
    """
    Accepts an image or video upload, runs deepfake detection, returns result.

    Expected: multipart/form-data with field "file"
    Returns:  JSON { result, confidence, label, face_detected, timestamp, ... }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Send a file in the 'file' field."}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename. Please select a file."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 415

    # Save with UUID filename to avoid conflicts
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    file.save(save_path)

    try:
        with open(save_path, "rb") as f:
            file_bytes = f.read()

        mime_type = get_mime_type(file.filename)
        prediction = detector.predict(file_bytes, mime_type=mime_type)

        response = {
            "result": prediction["result"],
            "confidence": prediction["confidence"],
            "label": prediction["label"],
            "face_detected": prediction["face_detected"],
            "mode": prediction["mode"],
            "filename": unique_filename,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if "warning" in prediction:
            response["warning"] = prediction["warning"]

        return jsonify(response)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 422

    except Exception as e:
        app.logger.error(f"Detection error: {e}")
        return jsonify({"error": "Internal server error during analysis."}), 500

    finally:
        # Clean up uploaded file
        if os.path.exists(save_path):
            os.remove(save_path)


@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"error": "File too large. Maximum size is 50 MB."}), 413


# ─── Startup ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 50)
    print("  DeepFake Detection API — Starting...")
    print("=" * 50)
    detector.load_model()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
