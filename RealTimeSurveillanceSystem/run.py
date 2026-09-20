import argparse

def main():
    parser = argparse.ArgumentParser(description="Surveillance System")
    parser.add_argument("--mode", choices=["camera", "dashboard"], default="camera")
    parser.add_argument("--headless", action="store_true", help="Skip cv2.imshow calls")
    args = parser.parse_args()

    if args.mode == "camera":
        from main import main as run_camera
        run_camera(headless=args.headless)
    elif args.mode == "dashboard":
        print("Streamlit dashboard must be launched separately:")
        print("  streamlit run dashboard_streamlit.py")

if __name__ == "__main__":
    main()
