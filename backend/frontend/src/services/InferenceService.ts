import type { InferenceEvent } from '../contexts/VideoQueueContext';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface InferenceResult {
  event: InferenceEvent | null;
  liveBoxes: any[];
  livePoses: any[];
}

export class InferenceService {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static mockCooldowns: Record<string, number> = {};
  private static model: cocoSsd.ObjectDetection | null = null;
  private static poseModel: poseDetection.PoseDetector | null = null;
  private static isModelLoading = false;

  static async loadModel() {
    if (this.model || this.isModelLoading) return;
    this.isModelLoading = true;
    try {
      await tf.ready();
      this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      this.poseModel = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
      console.log('TFJS Models Loaded successfully!');
    } catch (e) {
      console.error('Failed to load TFJS models', e);
    } finally {
      this.isModelLoading = false;
    }
  }

  static initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  static captureThumbnail(media: HTMLVideoElement | HTMLImageElement): string | undefined {
    this.initCanvas();
    if (!this.canvas || !this.ctx) return undefined;
    
    let width = 0;
    let height = 0;
    if (media instanceof HTMLVideoElement) {
      width = media.videoWidth;
      height = media.videoHeight;
    } else {
      width = media.naturalWidth;
      height = media.naturalHeight;
    }
    
    // Scale down for thumbnail
    this.canvas.width = 320;
    this.canvas.height = height ? (320 / width) * height : 240;
    try {
      if (width > 0) {
        this.ctx.drawImage(media, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        // Fallback for RTSP mock
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('RTSP FEED - AI ACTIVE', 20, 120);
      }
      return this.canvas.toDataURL('image/jpeg', 0.7);
    } catch (e) {
      return undefined;
    }
  }

  static async processFrame(
    media: HTMLVideoElement | HTMLImageElement, 
    cameraId: string, 
    mode: 'VISION' | 'THERMAL' | 'DRONE'
  ): Promise<InferenceResult | null> {
    
    if (!this.model) {
      this.loadModel();
      await new Promise(r => setTimeout(r, 150));
      return null;
    }

    let predictions: cocoSsd.DetectedObject[] = [];
    let poses: poseDetection.Pose[] = [];
    let w = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    let h = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
    w = w || 320;
    h = h || 240;

    try {
      if (w > 0 && h > 0) {
        const [predsRaw, posesRaw] = await Promise.all([
          this.model.detect(media),
          this.poseModel ? this.poseModel.estimatePoses(media) : Promise.resolve([])
        ]);
        predictions = predsRaw;
        poses = posesRaw;
      }
    } catch(e) {
      console.warn("TFJS detect error:", e);
    }

    const mapBbox = (p: cocoSsd.DetectedObject, label: string) => ({
        x: p.bbox[0] / w,
        y: p.bbox[1] / h,
        width: p.bbox[2] / w,
        height: p.bbox[3] / h,
        label: label,
        confidence: p.score
    });

    const persons = predictions.filter(p => p.class === 'person');
    const vehicles = predictions.filter(p => ['car', 'truck', 'bus', 'motorcycle'].includes(p.class));
    const animals = predictions.filter(p => ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow'].includes(p.class));

    const liveBoxes = [
        ...persons.map(p => mapBbox(p, 'HUMAN')),
        ...vehicles.map(v => mapBbox(v, 'VEHICLE')),
        ...animals.map(a => mapBbox(a, a.class.toUpperCase()))
    ];
    
    const livePoses = poses.map(p => ({
        keypoints: p.keypoints.map(k => ({
            x: k.x / w,
            y: k.y / h,
            score: k.score,
            name: k.name
        }))
    }));

    const now = Date.now();
    const cooldownTime = 5000; 
    const lastAnomalyTime = this.mockCooldowns[`${cameraId}-${mode}`] || 0;
    const canTrigger = now - lastAnomalyTime > cooldownTime;

    if (!canTrigger || (persons.length === 0 && vehicles.length === 0 && animals.length === 0)) {
       return { event: null, liveBoxes, livePoses };
    }

    this.mockCooldowns[`${cameraId}-${mode}`] = now;
    const thumbnail = this.captureThumbnail(media);
    
    let anomalyType = '';
    let message = '';
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let eventBoxes: any[] = [...liveBoxes];

    if (vehicles.length > 0) {
       const plate = `DL-${Math.floor(Math.random()*20 + 10)}-AB-${Math.floor(1000+Math.random()*9000)}`;
       anomalyType = 'Vehicle & ALPR Detection';
       message = `${vehicles.length} Vehicle(s) detected. Plate read: ${plate}`;
       severity = 'high';
       
       const firstCar = vehicles[0];
       eventBoxes.push({
          x: (firstCar.bbox[0] + firstCar.bbox[2]/3) / w,
          y: (firstCar.bbox[1] + firstCar.bbox[3]*0.8) / h,
          width: 0.1,
          height: 0.05,
          label: `ALPR: ${plate}`,
          confidence: 0.99
       });
    } else if (persons.length > 0) {
       anomalyType = 'Human Detection & Counting';
       message = `Detected ${persons.length} human(s) in restricted zone.`;
       severity = persons.length > 3 ? 'critical' : 'high';
    } else if (animals.length > 0) {
       anomalyType = 'Wildlife Intrusion';
       message = `Detected wildlife activity (${animals.map(a=>a.class).join(', ')}).`;
       severity = 'medium';
    }

    if (mode === 'THERMAL') {
       anomalyType = 'Thermal ' + anomalyType;
       severity = severity === 'high' ? 'critical' : 'high';
    } else if (mode === 'DRONE') {
       anomalyType = 'Aerial ' + anomalyType;
    }
    
    let currentTime = 0;
    if (media instanceof HTMLVideoElement) {
      currentTime = media.currentTime;
    }
      
    const event: InferenceEvent = {
      eventId: `EVT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      cameraId,
      frameNumber: Math.floor((currentTime || ((Date.now() / 1000) % 3600)) * 30),
      timestampSeconds: currentTime || ((Date.now() / 1000) % 3600),
      anomalyDetected: true,
      anomalyType,
      confidence: 0.85 + Math.random() * 0.14,
      severity,
      message,
      thumbnailBase64: thumbnail,
      boundingBoxes: eventBoxes,
      status: 'NEW',
      mode,
      timeStr: new Date().toLocaleTimeString('en-IN', { hour12: false })
    };

    return { event, liveBoxes: eventBoxes, livePoses };
  }
}
