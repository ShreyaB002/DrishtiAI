import cv2
import numpy as np

def darken_image(input_path, output_path):
    img = cv2.imread(input_path)
    dark = (img * 0.3).astype(np.uint8)
    cv2.imwrite(output_path, dark)

def enhance_image(input_path, output_path):
    img = cv2.imread(input_path)

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)

    enhanced = cv2.merge((cl, a, b))
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    cv2.imwrite(output_path, enhanced)
