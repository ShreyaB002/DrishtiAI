import cv2
import os

def enhance_folder(input_folder):
    for filename in os.listdir(input_folder):
        if filename.endswith(".jpg"):
            path = os.path.join(input_folder, filename)

            img = cv2.imread(path)
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)

            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            cl = clahe.apply(l)

            enhanced = cv2.merge((cl, a, b))
            enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

            cv2.imwrite(path, enhanced)

    print("Enhancement complete!")

if __name__ == "__main__":
    enhance_folder(r"C:\Users\krary\OneDrive\Desktop\datasets\coco128_enhanced\images\train2017")
