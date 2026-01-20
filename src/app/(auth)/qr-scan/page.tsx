'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Camera, 
    UploadCloud, 
    ScanLine, 
    StopCircle,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function QrScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Error de Cámara",
        description: "Tu navegador no soporta el acceso a la cámara.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Acceso a Cámara Denegado",
        description: "Por favor, habilita los permisos de cámara en tu navegador.",
      });
    }
  }, [toast]);

  const handleStartScan = () => {
    setIsScanning(true);
    startCamera();
  };

  const handleStopScan = () => {
    setIsScanning(false);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Escaneo de Código QR</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleStartScan} disabled={isScanning}>
                <ScanLine className="mr-2 h-4 w-4" /> Iniciar Escáner
                </Button>
                <Button variant="outline" onClick={handleStopScan} disabled={!isScanning}>
                <StopCircle className="mr-2 h-4 w-4" /> Detener Escáner
                </Button>
            </div>

            <Card className="w-full aspect-video relative overflow-hidden">
              <CardContent className="p-0 flex items-center justify-center h-full bg-muted">
                  <video ref={videoRef} className={`w-full h-full object-cover ${!isScanning && 'hidden'}`} autoPlay muted playsInline />
                  {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="h-16 w-16 mb-4"/>
                          <p>El escáner está detenido</p>
                      </div>
                  )}
                  {isScanning && hasCameraPermission === null && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <p>Solicitando permiso de cámara...</p>
                      </div>
                  )}
                  {hasCameraPermission === false && (
                      <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center p-4">
                          <Alert variant="destructive">
                              <AlertTitle>Error de Cámara</AlertTitle>
                              <AlertDescription>
                              No se pudo acceder a la cámara. Por favor, revisa los permisos en tu navegador.
                              </AlertDescription>
                          </Alert>
                      </div>
                  )}
                  {isScanning && hasCameraPermission && (
                       <div className="absolute inset-0 border-4 border-primary/50 rounded-md animate-pulse">
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 -translate-y-1/2"></div>
                       </div>
                  )}
              </CardContent>
            </Card>
        </div>
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2">Subir Imagen QR</h2>
            <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer flex-grow">
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 font-semibold">
                    <span className="text-primary">Haz clic aquí</span> o arrastra una imagen
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3"/>
                    Encuentra un libro subiendo su QR
                </p>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
            </div>
        </div>
      </div>
    </div>
  );
}
