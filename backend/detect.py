from ultralytics import YOLO
import cv2
import os


# Load YOLO model
model = YOLO("yolo11n.pt")


def detect_emergency_vehicle(video_path: str):

    print("===================================")
    print("AI VIDEO DETECTION STARTED")
    print("===================================")
    print(f"Video: {video_path}")

    # Check video exists
    if not os.path.exists(video_path):
        return {
            "success": False,
            "emergency_vehicle_candidate": False,
            "message": "Video file not found",
            "video_path": video_path
        }

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return {
            "success": False,
            "emergency_vehicle_candidate": False,
            "message": "Could not open video"
        }

    frames_checked = 0

    detections = []

    highest_confidence = 0.0

    detected_vehicle = None

    # Analyze first 30 frames
    while frames_checked < 30:

        success, frame = cap.read()

        if not success:
            break

        # Run YOLO
        results = model(
            frame,
            verbose=False
        )

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(box.cls[0])

                confidence = float(box.conf[0])

                class_name = model.names[class_id]

                # Save detections above 40%
                if confidence >= 0.40:

                    detections.append({
                        "object": class_name,
                        "confidence": round(
                            confidence * 100,
                            2
                        )
                    })

                # Standard YOLO vehicle classes
                vehicle_classes = [
                    "car",
                    "truck",
                    "bus",
                    "motorcycle"
                ]

                if (
                    class_name in vehicle_classes
                    and confidence >= 0.50
                ):

                    if confidence > highest_confidence:

                        highest_confidence = confidence

                        detected_vehicle = class_name

        frames_checked += 1

    cap.release()

    # Emergency candidate
    emergency_vehicle_candidate = (
        detected_vehicle is not None
    )

    result = {

        "success": True,

        "emergency_vehicle_candidate":
            emergency_vehicle_candidate,

        "detected_vehicle":
            detected_vehicle,

        "confidence":
            round(
                highest_confidence * 100,
                2
            ),

        "frames_checked":
            frames_checked,

        "detections":
            detections[:30],

        "message":
            (
                "Emergency vehicle candidate detected."
                if emergency_vehicle_candidate
                else
                "No emergency vehicle candidate detected."
            )
    }

    print("===================================")
    print("AI DETECTION RESULT")
    print("===================================")
    print(result)

    return result