import type { InferenceEvent } from '../contexts/VideoQueueContext';

export class InferenceService {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static mockCooldowns: Record<string, number> = {};

  static initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  static captureThumbnail(video: HTMLVideoElement): string | undefined {
    this.initCanvas();
    if (!this.canvas || !this.ctx) return undefined;
    
    // Scale down for thumbnail
    this.canvas.width = 320;
    this.canvas.height = video.videoHeight ? (320 / video.videoWidth) * video.videoHeight : 240;
    try {
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      return this.canvas.toDataURL('image/jpeg', 0.7);
    } catch (e) {
      return undefined;
    }
  }

  static async processFrame(
    video: HTMLVideoElement, 
    cameraId: string, 
    mode: 'VISION' | 'THERMAL' | 'DRONE'
  ): Promise<InferenceEvent | null> {
    // In a real scenario, we would capture the frame and POST it to backend:
    // const thumbnail = this.captureThumbnail(video);
    // const blob = await new Promise(res => this.canvas.toBlob(res, 'image/jpeg'));
    // return fetch('/api/detect', { method: 'POST', body: blob }).then(r => r.json());

    // --- MOCK INFERENCE ADAPTER ---
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 150)); // Simulating ~6-7 FPS inference

    const now = Date.now();
    const cooldownTime = 8000; // 8 seconds cooldown per mode/camera combination

    // Only generate an anomaly if we are past the cooldown
    const lastAnomalyTime = this.mockCooldowns[`${cameraId}-${mode}`] || 0;
    const canTrigger = now - lastAnomalyTime > cooldownTime;

    // Random chance to trigger anomaly if off cooldown
    if (canTrigger && Math.random() < 0.05) { // 5% chance per frame if off cooldown
      this.mockCooldowns[`${cameraId}-${mode}`] = now;
      
      const thumbnail = this.captureThumbnail(video);
      
      const numHumans = Math.floor(Math.random() * 3) + 1; // 1 to 3 humans
      const activity = 'Crossing the fence';
      
      const event: InferenceEvent = {
        eventId: `EVT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        cameraId,
        frameNumber: Math.floor(video.currentTime * 30),
        timestampSeconds: video.currentTime,
        anomalyDetected: true,
        anomalyType: mode === 'VISION' ? 'Intrusion Detected' : mode === 'THERMAL' ? 'Heat Anomaly' : 'Perimeter Breach',
        confidence: 0.85 + Math.random() * 0.14,
        severity: Math.random() > 0.8 ? 'critical' : 'high',
        message: mode === 'VISION' ? `${numHumans} Human(s) Detected | Activity: ${activity}` : mode === 'THERMAL' ? `Abnormal heat signature detected in Sector 2A.` : `Unrecognized vehicle detected crossing restricted zone.`,
        thumbnailBase64: thumbnail,
        boundingBoxes: Array.from({ length: mode === 'VISION' ? numHumans : 1 }).map(() => ({
          x: 0.2 + Math.random() * 0.5,
          y: 0.2 + Math.random() * 0.5,
          width: 0.08 + Math.random() * 0.15,
          height: 0.15 + Math.random() * 0.25,
          label: mode === 'VISION' ? 'human' : mode === 'THERMAL' ? 'heat source' : 'vehicle',
          confidence: 0.85 + Math.random() * 0.14
        })),
        status: 'NEW',
        mode,
        timeStr: new Date().toLocaleTimeString('en-IN', { hour12: false })
      };
      return event;
    }

    return null;
  }
}
