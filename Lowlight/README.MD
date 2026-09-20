 # Low-Light Object Detection & Enhancement

This project combines low-light image enhancement techniques with object detection using YOLOv8. It is designed to improve visibility in dark images before performing object detection.

## Project Structure

- **enhance.py**: Core utility functions for image processing. Contains algorithms to artificially darken images and enhance low-light images using CLAHE (Contrast Limited Adaptive Histogram Equalization).
- **make_dark.py**: A demonstration script that takes an input image (`bus.jpg`), creates a darkened version (`bus_dark.jpg`), and then applies enhancement (`bus_enhanced.jpg`).
- **train.py**: Script to train a YOLOv8n model on a dataset (currently configured for `coco128.yaml`).
- **configs/**: Configuration files.
- **inference.py**: (Placeholder) For running inference on images/videos.
- **evaluate.py**: (Placeholder) For evaluating model performance.

## Installation

1. Clone the repository.
```bash
git clone https://github.com/witharyank/Lowlight
cd lowlight
```
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Image Enhancement Demo

To test the image enhancement capabilities:

```bash
python make_dark.py
```

This will generate:
- `bus_dark.jpg`: Artificially darkened image.
- `bus_enhanced.jpg`: The restored version of the dark image.

### Training the Model

To start training the YOLOv8 model:

```bash
python train.py
```

*Note: Ensure you have the necessary datasets configured in your YAML files.*

## Requirements

- Python 3.8+
- OpenCV
- Ultralytics YOLO
- NumPy
- (See `requirements.txt` for full list with versions)

## Author
Kumar Aryan GitHub: https://github.com/witharyank