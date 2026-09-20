from ultralytics import YOLO

def main():
    model = YOLO("yolov8m.pt")  # balanced power

    model.train(
        data="C:/Users/krary/OneDrive/Desktop/datasets/coco128_enhanced/coco128_enhanced.yaml",
        epochs=40,
        imgsz=768,
        batch=8,
        cos_lr=True,
        patience=10,
        hsv_h=0.02,
        hsv_s=0.8,
        hsv_v=0.6,
        mosaic=0.5,
        mixup=0.1,
        name="v8m_768_enhanced"
    )


if __name__ == "__main__":
    main()
