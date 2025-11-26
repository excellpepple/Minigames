"""
This script processes a dataset of static hand gesture images, extracts hand landmarks using MediaPipe, and saves the compressed landmark data into a .npz file.
It supports resuming from previous sessions and handles keyboard interrupts gracefully by saving progress before exiting.
@author: Excell Pepple
"""
import os
import cv2
import numpy as np
import mediapipe as mp
import sys
import signal

# Suppress TensorFlow / MediaPipe logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_CPP_MIN_VLOG_LEVEL"] = "3"
import logging
logging.getLogger("tensorflow").setLevel(logging.ERROR)
import absl.logging
absl.logging.set_verbosity(absl.logging.ERROR)

# ===== Setup MediaPipe =====
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

# ===== Config =====
DATASET_DIR = "D:/Datasets/HAGRID_512/hagrid-classification-512p"
OUTPUT_NPZ = "output/compressed/hagrid_static_gestures.npz"

# ===== Ask user if resuming =====
resume_flag = input("Resume previous session if exists? (y/n): \n").strip().lower() == "y"


if resume_flag and os.path.exists(OUTPUT_NPZ):
    data = np.load(OUTPUT_NPZ, allow_pickle=True)
    samples = data["data"].tolist()
    processed_files_set = set((s[0], idx) for idx, s in enumerate(samples))
    print(f"Resuming previous session with {len(samples)} samples loaded.")
else:
    samples = []
    processed_files_set = set()

# ===== Keyboard interrupt handling =====
def handle_exit(signum, frame):
    print("\nPausing script... saving current progress.")
    np.savez_compressed(OUTPUT_NPZ, data=np.array(samples, dtype=object))
    print(f"Saved {len(samples)} samples → {OUTPUT_NPZ}")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)

# ===== Count total files =====
total_files = sum(len([f for f in os.listdir(os.path.join(DATASET_DIR, l))
                       if f.lower().endswith((".jpg",".jpeg",".png"))])
                  for l in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, l)))
processed_files = len(samples)

print()
# ===== Main processing loop =====
for label in os.listdir(DATASET_DIR):
    label_dir = os.path.join(DATASET_DIR, label)
    if not os.path.isdir(label_dir):
        continue

    label_files = [f for f in os.listdir(label_dir) if f.lower().endswith((".jpg",".jpeg",".png"))]
    num_label_files = len(label_files)

    for idx, img_name in enumerate(label_files):
        # Skip if resuming and already processed
        if (label, idx) in processed_files_set:
            continue

        img_path = os.path.join(label_dir, img_name)
        image = cv2.imread(img_path)
        if image is None:
            continue

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        # Default: 21 landmarks × 3
        lm = np.zeros(21*3, dtype=np.float32)
        if result.multi_hand_landmarks:
            lm_list = result.multi_hand_landmarks[0].landmark
            lm = np.array([[l.x, l.y, l.z] for l in lm_list], dtype=np.float32).flatten()

        # Label as first column
        sample = np.concatenate(([label], lm.astype(object)))
        samples.append(sample)
        processed_files_set.add((label, idx))
        processed_files += 1
        overall_progress  = (processed_files/total_files) * 100
        LabelProgress = ((idx+1)/num_label_files) * 100
        # Single-line progress
        print(f"\rOverall: ({overall_progress:.2f}%) {processed_files}/{total_files} | Label: ({LabelProgress:.2f}%) {label} {idx+1}/{num_label_files}", end='')
        sys.stdout.flush()

# Save final dataset
np.savez_compressed(OUTPUT_NPZ, data=np.array(samples, dtype=object))
print(f"\nSaved final dataset: {len(samples)} samples → {OUTPUT_NPZ}")
