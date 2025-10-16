import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import load_model


mpHands = mp.solutions.hands
mpPose = mp.solutions.pose
mpDraw = mp.solutions.drawing_utils
