"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, RefreshCcw, CheckCircle, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LiveScanProps {
  onCapture: (imageData: string | null) => void;
}

export default function LiveScan({ onCapture }: LiveScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const { toast } = useToast();

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = devices.filter((device) => device.kind === 'videoinput');
      setVideoDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(async (deviceId: string) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: 1280,
            height: 720,
          },
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.onloadedmetadata = () => setIsCameraReady(true);
        }
        // After getting permission, enumerate devices
        await getDevices();
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions and try again."
        });
      }
    }
  }, [getDevices, stream, toast]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera(selectedDeviceId);
    } else {
       if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
       }
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, selectedDeviceId]);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        onCapture(dataUrl);
        setIsCameraReady(false);
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    onCapture(null);
    setIsCameraReady(false);
  };
  
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6" />
          <span>Live Eye Scan</span>
        </CardTitle>
        <CardDescription>Place your eyes within the circular frames for an accurate scan.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
               <div className="absolute inset-0 flex items-center justify-center gap-8">
                <div className="h-2/5 w-2/5 rounded-full border-4 border-dashed border-primary/50" />
                <div className="h-2/5 w-2/5 rounded-full border-4 border-dashed border-primary/50" />
              </div>
              {!isCameraReady && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white">Starting camera...</p>
                </div>
              )}
            </>
          ) : (
             <Image src={capturedImage} alt="Captured eye scan" layout="fill" objectFit="cover" />
          )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {!capturedImage && videoDevices.length > 1 && (
          <div className="mt-4">
            <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-full">
                <Video className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-4">
          {!capturedImage ? (
            <Button onClick={captureImage} disabled={!isCameraReady} size="lg">
              <Camera className="mr-2 h-4 w-4" />
              Capture Scan
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle />
                <span>Scan Captured</span>
              </div>
              <Button onClick={resetCapture} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
