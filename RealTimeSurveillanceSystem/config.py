import yaml
import os

def load_config():
    config_path = os.environ.get("CONFIG_PATH", "config.yaml")
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    required_top = ["cameras", "line_position", "detection", "alerts", "db", "zones"]
    for key in required_top:
        if key not in config:
            raise ValueError(f"Missing required config key: {key}")

    if "person_model" not in config["detection"]:
        raise ValueError("Missing detection.person_model")
    if "threshold_sec" not in config.get("loitering", {}):
        raise ValueError("Missing loitering.threshold_sec")
    if "crowd_threshold" not in config["alerts"]:
        raise ValueError("Missing alerts.crowd_threshold")

    return config
