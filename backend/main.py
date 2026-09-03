from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path

from detect import detect_emergency_vehicle


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="E-Corridor AI Emergency Response API",
    description="AI-powered emergency traffic corridor prototype",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-emergency-corridor.vercel.app"
],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class EmergencyRequest(BaseModel):

    ambulance_id: str

    latitude: float = 17.6868

    longitude: float = 83.2185

    destination: str = "City Hospital"


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "system": "E-Corridor",

        "status": "online",

        "message":
            "AI Emergency Corridor API",

        "version": "1.0.0"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "healthy",

        "backend": "FastAPI",

        "ai_engine": "YOLO",

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# YOLO DETECTION
# ============================================================

@app.get("/detect")
def detect():

    # backend/
    backend_directory = (
        Path(__file__).resolve().parent
    )

    # AI-Emergency Corridor/
    project_directory = (
        backend_directory.parent
    )

    # frontend/public/videos/ambulance.mp4
    video_path = backend_directory / "videos" / "ambulance.mp4"

    print()
    print("===================================")
    print("E-CORRIDOR AI VISION")
    print("===================================")
    print(f"Video: {video_path}")
    print()

    result = detect_emergency_vehicle(
        str(video_path)
    )

    return result


# ============================================================
# TRAFFIC
# ============================================================

@app.get("/traffic")
def traffic():

    return {

        "traffic_density": 42,

        "congestion_level":
            "MODERATE",

        "vehicles_detected": 18,

        "signals_available": 4,

        "signals_ready": 4,

        "recommended_action":
            "CLEAR_EMERGENCY_ROUTE"
    }


# ============================================================
# ROUTE
# ============================================================

@app.get("/route")
def route():

    return {

        "status": "OPTIMAL",

        "route":
            "Central Road → Main Junction → City Hospital",

        "distance_km": 4.8,

        "eta_minutes": 6.42,

        "normal_eta_minutes": 14.42,

        "time_saved_minutes": 8,

        "traffic_level":
            "MODERATE"
    }


# ============================================================
# EMERGENCY CORRIDOR ACTIVATION
# ============================================================

@app.post("/emergency")
def emergency(
    data: EmergencyRequest
):

    return {

        "success": True,

        "ambulance_id":
            data.ambulance_id,

        "status":
            "EMERGENCY_DETECTED",

        "location": {

            "latitude":
                data.latitude,

            "longitude":
                data.longitude
        },

        "destination":
            data.destination,

        # --------------------------------------------
        # TRAFFIC
        # --------------------------------------------

        "traffic_analysis": {

            "density": 42,

            "level":
                "MODERATE",

            "vehicles_detected":
                18
        },

        # --------------------------------------------
        # ROUTE
        # --------------------------------------------

        "route": {

            "status":
                "OPTIMAL",

            "distance_km":
                4.8,

            "eta_minutes":
                6.42,

            "normal_eta_minutes":
                14.42,

            "time_saved_minutes":
                8
        },

        # --------------------------------------------
        # SIGNALS
        # --------------------------------------------

        "signals": {

            "total": 4,

            "coordinated": 4,

            "status":
                "GREEN",

            "signal_ids": [

                "SIG-01",

                "SIG-02",

                "SIG-03",

                "SIG-04"
            ]
        },

        # --------------------------------------------
        # AI
        # --------------------------------------------

        "ai": {

            "decision":
                "ACTIVATE_CORRIDOR",

            "route_confidence":
                96.8,

            "traffic_prediction":
                "MODERATE"
        },

        "ai_confidence":
            96.8,

        # --------------------------------------------
        # CORRIDOR
        # --------------------------------------------

        "corridor":
            "ACTIVE",

        "message":
            "Emergency corridor successfully activated.",

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# SIGNALS
# ============================================================

@app.get("/signals")
def signals():

    return {

        "total_signals": 4,

        "coordinated_signals": 4,

        "corridor_status":
            "ACTIVE",

        "signals": [

            {
                "id": "SIG-01",
                "status": "GREEN"
            },

            {
                "id": "SIG-02",
                "status": "GREEN"
            },

            {
                "id": "SIG-03",
                "status": "GREEN"
            },

            {
                "id": "SIG-04",
                "status": "GREEN"
            }
        ]
    }


# ============================================================
# DEACTIVATE CORRIDOR
# ============================================================

@app.post("/deactivate")
def deactivate():

    return {

        "success": True,

        "corridor":
            "INACTIVE",

        "signals":
            "NORMAL",

        "message":
            "Emergency corridor deactivated.",

        "timestamp":
            datetime.now().isoformat()
    }